import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockApiClients } from '#lib/test-support/mocks.ts';

/**
 * The emailed verification link answers AT the link.
 *
 * Its recipient is normally signed out, so the page at `/email/verifications/<token>` is the only
 * place they can read whether it worked. A redirect away from it drops the token from the URL,
 * which the platform's emailed-link probe cannot tell apart from an auth gate swallowing the link,
 * so every outcome here — verified, a token the platform does not hold, an outage — is data the
 * page renders rather than a redirect.
 */

const client = {
  updateEmailVerificationByToken: vi.fn()
};

vi.mock('#lib/api/clients.ts', async (importOriginal) => mockApiClients(client, importOriginal));

const { load } = await import('./email/verifications/[token]/+page.server');

function visit(token: string) {
  return (load as (event: unknown) => Promise<unknown>)({ params: { token }, locals: {}, cookies: {} });
}

beforeEach(() => {
  vi.clearAllMocks();
  client.updateEmailVerificationByToken.mockResolvedValue(undefined);
});

describe('the emailed verification link', () => {
  it('renders the success at the link rather than redirecting', async () => {
    expect(await visit('good-token')).toEqual({ verified: true });
    expect(client.updateEmailVerificationByToken).toHaveBeenCalledWith('good-token');
  });

  it('renders a token the platform does not hold as no longer valid, without redirecting', async () => {
    client.updateEmailVerificationByToken.mockRejectedValue(
      Object.assign(new Error('Not Found'), { status: 404, response: { status: 404 } })
    );

    expect(await visit('probe-no-such-token')).toEqual({
      verified: false,
      message: 'That verification link is no longer valid. Please request a new one.'
    });
  });

  it('does not call an outage a dead link', async () => {
    client.updateEmailVerificationByToken.mockRejectedValue(new Error('fetch failed'));

    const result = (await visit('good-token')) as { verified: boolean; message: string };

    expect(result.verified).toBe(false);
    expect(result.message).not.toMatch(/no longer valid/);
  });
});
