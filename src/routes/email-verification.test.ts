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
  return (load as (event: unknown) => Promise<unknown>)({
    params: { token },
    locals: {},
    cookies: {},
    url: new URL(`https://app.apibuilder.io/email/verifications/${token}`)
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  client.updateEmailVerificationByToken.mockResolvedValue(undefined);
});

describe('the emailed verification link', () => {
  it('renders the success at the link rather than redirecting', async () => {
    expect(await visit('good-token')).toEqual({ outcome: 'verified', retryUrl: '/email/verifications/good-token' });
    expect(client.updateEmailVerificationByToken).toHaveBeenCalledWith('good-token');
  });

  it('renders a token the platform does not hold as no longer valid, without redirecting', async () => {
    client.updateEmailVerificationByToken.mockRejectedValue(
      Object.assign(new Error('Not Found'), { status: 404, response: { status: 404 } })
    );

    expect(await visit('probe-no-such-token')).toMatchObject({ outcome: 'invalid' });
  });

  it('does not call an outage a dead link, and offers the same link again', async () => {
    client.updateEmailVerificationByToken.mockRejectedValue(new Error('fetch failed'));

    expect(await visit('good-token')).toEqual({ outcome: 'unavailable', retryUrl: '/email/verifications/good-token' });
  });

  it.each([500, 502, 503])('does not call a %i a dead link', async (status) => {
    client.updateEmailVerificationByToken.mockRejectedValue(Object.assign(new Error('boom'), { status, response: { status } }));

    expect(await visit('good-token')).toMatchObject({ outcome: 'unavailable' });
  });
});
