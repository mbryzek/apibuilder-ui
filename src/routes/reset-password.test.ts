import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invokeAction } from '#lib/test-support/invoke-action.ts';
import { mockApiClients } from '#lib/test-support/mocks.ts';
import { caughtAsync } from '#lib/test-support/throws.ts';

/**
 * The emailed reset link is how a locked-out user gets back in. The action must refuse a bad
 * password pair without spending the single-use token, and set the password with the token from
 * the path when the pair is good. Only a live link gets the form at all, and which failure means
 * the link is dead is what the load and the action must get right.
 */

const client = {
  createTenantSessionPasswordAndChanges: vi.fn(),
  getTenantSessionPasswordAndResetsById: vi.fn()
};

vi.mock('#lib/api/clients.ts', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions, load } = await import('./login/reset-password/[token]/+page.server');

const cookies = { get: () => undefined, set: vi.fn(), delete: () => {} };

function submit(form: Record<string, string>) {
  return invokeAction<{ status?: number; data?: { errors?: { field?: string; message: string }[]; linkInvalid?: boolean } }>(
    actions['default'],
    {
      form,
      params: { token: 'tok-1' },
      cookies
    }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  client.getTenantSessionPasswordAndResetsById.mockReset();
  client.getTenantSessionPasswordAndResetsById.mockResolvedValue(undefined);
  client.createTenantSessionPasswordAndChanges.mockReset();
});

const failure = (status: number) => Object.assign(new Error('failed'), { status, response: { status } });

function visit(token: string) {
  return (load as (event: unknown) => Promise<unknown>)({
    params: { token },
    url: new URL(`https://app.apibuilder.io/login/reset-password/${token}`)
  });
}

describe('the reset-password page', () => {
  it('reads the link without spending it, and a live link is the form', async () => {
    expect(await visit('tok-1')).toMatchObject({ outcome: { kind: 'ready' }, retryUrl: '/login/reset-password/tok-1' });

    expect(client.getTenantSessionPasswordAndResetsById).toHaveBeenCalledWith(expect.objectContaining({ id: 'tok-1' }));
    expect(client.createTenantSessionPasswordAndChanges).not.toHaveBeenCalled();
  });

  it('reports an id the platform does not hold as a dead link', async () => {
    client.getTenantSessionPasswordAndResetsById.mockRejectedValue(failure(404));

    expect(await visit('pwr-no-such-reset-link')).toMatchObject({ outcome: { kind: 'invalid' } });
  });

  it.each([500, 503])('does not call a %i a dead link', async (status) => {
    client.getTenantSessionPasswordAndResetsById.mockRejectedValue(failure(status));

    expect(await visit('tok-1')).toMatchObject({ outcome: { kind: 'unavailable' } });
  });

  it('does not call an outage a dead link', async () => {
    client.getTenantSessionPasswordAndResetsById.mockRejectedValue(new Error('fetch failed'));

    expect(await visit('tok-1')).toMatchObject({ outcome: { kind: 'unavailable' } });
  });
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

  const goodPair = { password: 'pw', confirm_password: 'pw' };

  it('answers with the dead-link state when the submit itself answers 404, without reading again', async () => {
    client.createTenantSessionPasswordAndChanges.mockRejectedValue(failure(404));

    expect(await submit(goodPair)).toMatchObject({ status: 404, data: { linkInvalid: true } });
    expect(client.getTenantSessionPasswordAndResetsById).not.toHaveBeenCalled();
  });

  it('passes a 422 through as the form error without reading the link', async () => {
    client.createTenantSessionPasswordAndChanges.mockRejectedValue(failure(422));

    const result = await submit(goodPair);

    expect(result.status).toBe(422);
    expect(result.data?.linkInvalid).toBeUndefined();
    expect(client.getTenantSessionPasswordAndResetsById).not.toHaveBeenCalled();
  });

  it('passes a platform failure through without reading the link', async () => {
    client.createTenantSessionPasswordAndChanges.mockRejectedValue(failure(500));

    expect((await submit(goodPair)).status).toBe(500);
    expect(client.getTenantSessionPasswordAndResetsById).not.toHaveBeenCalled();
  });
});
