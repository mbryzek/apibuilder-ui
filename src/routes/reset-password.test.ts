import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invokeAction } from '#lib/test-support/invoke-action.ts';
import { mockApiClients } from '#lib/test-support/mocks.ts';
import { caughtAsync } from '#lib/test-support/throws.ts';

/**
 * The emailed reset link is how a locked-out user gets back in. The action must refuse a bad
 * password pair without spending the single-use token, and set the password with the token from
 * the path when the pair is good.
 */

const client = {
  createTenantSessionPasswordAndChanges: vi.fn()
};

vi.mock('#lib/api/clients.ts', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions } = await import('./login/reset-password/[token]/+page.server');

const cookies = { get: () => undefined, set: vi.fn(), delete: () => {} };

function submit(form: Record<string, string>) {
  return invokeAction<{ status?: number; data?: { errors?: { field?: string; message: string }[] } }>(actions['default'], {
    form,
    params: { token: 'tok-1' },
    cookies
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('the reset-password action', () => {
  it('refuses an empty password without spending the token', async () => {
    const result = await submit({ password: '', confirm_password: '' });

    expect(result.status).toBe(400);
    expect(result.data?.errors).toEqual([{ field: 'password', message: 'Choose a password' }]);
    expect(client.createTenantSessionPasswordAndChanges).not.toHaveBeenCalled();
  });

  it('refuses mismatched passwords without spending the token', async () => {
    const result = await submit({ password: 'a', confirm_password: 'b' });

    expect(result.status).toBe(400);
    expect(result.data?.errors).toEqual([{ field: 'password', message: 'Passwords do not match' }]);
    expect(client.createTenantSessionPasswordAndChanges).not.toHaveBeenCalled();
  });

  it('sets the password with the token from the path, untrimmed, and signs the user in', async () => {
    client.createTenantSessionPasswordAndChanges.mockResolvedValue({
      discriminator: 'tenant_session',
      session: { id: 'ses-1' },
      user: { id: 'usr-1' }
    });

    const thrown = await caughtAsync(() => submit({ password: ' pw ', confirm_password: ' pw ' }));

    expect(client.createTenantSessionPasswordAndChanges).toHaveBeenCalledWith(
      expect.objectContaining({ body: { id: 'tok-1', password: ' pw ' } })
    );
    expect(cookies.set).toHaveBeenCalled();
    expect(thrown.status).toBe(303);
    expect(thrown.location).toBe('/');
  });
});
