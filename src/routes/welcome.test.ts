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
  getUserActivationByToken: vi.fn(),
  createUserActivationPasswordByToken: vi.fn()
};

vi.mock('#lib/api/clients.ts', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions, load } = await import('./welcome/[token]/+page.server');

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
});

function visit(token: string) {
  return (load as (event: unknown) => Promise<unknown>)({ params: { token }, url: new URL(`https://app.apibuilder.io/welcome/${token}`) });
}

describe('the welcome page', () => {
  it('greets the invitee by name and address, and carries nothing else of the activation', async () => {
    client.getUserActivationByToken.mockResolvedValue({
      user: { id: 'usr-1' },
      expires_at: '2026-10-01T00:00:00Z',
      name: 'Casey',
      email: { id: 'eml-1', address: 'casey@example.com' }
    });

    expect(await visit('tok-1')).toEqual({
      outcome: { kind: 'ready', name: 'Casey', email: 'casey@example.com' },
      retryUrl: '/welcome/tok-1'
    });
    expect(client.getUserActivationByToken).toHaveBeenCalledWith('tok-1');
  });

  it('greets nobody when the person record carries neither field', async () => {
    client.getUserActivationByToken.mockResolvedValue({ user: { id: 'usr-1' }, expires_at: '2026-10-01T00:00:00Z' });

    expect(await visit('tok-1')).toMatchObject({ outcome: { kind: 'ready' } });
  });

  it('reports a token the platform does not hold as a dead link', async () => {
    client.getUserActivationByToken.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404, response: { status: 404 } }));

    expect(await visit('probe-no-such-token')).toMatchObject({ outcome: { kind: 'invalid' } });
  });

  it.each([500, 503])('does not call a %i a dead link', async (status) => {
    client.getUserActivationByToken.mockRejectedValue(Object.assign(new Error('boom'), { status, response: { status } }));

    expect(await visit('tok-1')).toMatchObject({ outcome: { kind: 'unavailable' } });
  });

  it('does not call an outage a dead link', async () => {
    client.getUserActivationByToken.mockRejectedValue(new Error('fetch failed'));

    expect(await visit('tok-1')).toMatchObject({ outcome: { kind: 'unavailable' } });
  });
});

describe('the welcome action', () => {
  it('refuses an empty password without spending the token', async () => {
    const result = await submit({ password: '', confirm_password: '' });

    expect(result.status).toBe(400);
    expect(result.data?.errors).toEqual([{ field: 'password', message: 'Choose a password' }]);
    expect(client.createUserActivationPasswordByToken).not.toHaveBeenCalled();
  });

  it.each(['b', 'a ', ''])('refuses a confirmation of %j that differs, without spending the token', async (confirm_password) => {
    const result = await submit({ password: 'a', confirm_password });

    expect(result.status).toBe(400);
    expect(result.data?.errors).toEqual([{ field: 'password', message: 'Passwords do not match' }]);
    expect(client.createUserActivationPasswordByToken).not.toHaveBeenCalled();
  });

  it('refuses mismatched passwords without spending the token', async () => {
    const result = await submit({ password: 'a', confirm_password: 'b' });

    expect(result.status).toBe(400);
    expect(result.data?.errors).toEqual([{ field: 'password', message: 'Passwords do not match' }]);
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
