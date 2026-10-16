import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invokeAction } from '#lib/test-support/invoke-action.ts';
import { mockApiClients } from '#lib/test-support/mocks.ts';
import { caughtAsync } from '#lib/test-support/throws.ts';

/**
 * The welcome link is the invitee's only way in: they have no password yet, so a dead end here is
 * an account nobody can open. What the action must get right is which failures mean the link is
 * dead and which mean "try again".
 */

const client = {
  createUserActivationPasswordByToken: vi.fn()
};

vi.mock('#lib/api/clients.ts', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions } = await import('./welcome/[token]/+page.server');

const cookies = { get: () => undefined, set: vi.fn(), delete: () => {} };

function submit(form: Record<string, string>) {
  return invokeAction<{ status?: number; data?: { errors?: { message: string }[]; linkInvalid?: boolean } }>(actions['default'], {
    form,
    params: { token: 'tok-1' },
    cookies
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('the welcome action', () => {
  it('refuses mismatched passwords without spending the token', async () => {
    const result = await submit({ password: 'a', confirm_password: 'b' });

    expect(result.status).toBe(400);
    expect(client.createUserActivationPasswordByToken).not.toHaveBeenCalled();
  });

  it('sets the password with the token from the path, signs the invitee in and lands them home', async () => {
    client.createUserActivationPasswordByToken.mockResolvedValue({
      discriminator: 'tenant_session',
      session: { id: 'ses-1' },
      user: { id: 'usr-1' }
    });

    const thrown = await caughtAsync(() => submit({ password: 'pw', confirm_password: 'pw' }));

    expect(client.createUserActivationPasswordByToken).toHaveBeenCalledWith({ token: 'tok-1', body: { password: 'pw' } });
    expect(cookies.set).toHaveBeenCalled();
    expect(thrown.status).toBe(303);
    expect(thrown.location).toBe('/');
  });

  it('reports a spent or expired invitation as a dead link, not as a rejected password', async () => {
    client.createUserActivationPasswordByToken.mockRejectedValue(
      Object.assign(new Error('Not Found'), { status: 404, response: { status: 404 } })
    );

    const result = await submit({ password: 'pw', confirm_password: 'pw' });

    expect(result.status).toBe(404);
    expect(result.data?.linkInvalid).toBe(true);
  });

  it('reports an outage as an outage, leaving the invitation usable', async () => {
    client.createUserActivationPasswordByToken.mockRejectedValue(new Error('fetch failed'));

    const result = await submit({ password: 'pw', confirm_password: 'pw' });

    expect(result.status).toBe(503);
    expect(result.data?.linkInvalid).toBeUndefined();
  });
});
