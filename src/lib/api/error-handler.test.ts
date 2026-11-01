import { beforeEach, describe, expect, it, vi } from 'vitest';

const { environment } = vi.hoisted(() => ({ environment: { browser: false } }));
// A getter, so a test can flip which half of PostHog the module under test reports through.
vi.mock('$app/env', () => ({
  get browser() {
    return environment.browser;
  },
  dev: false
}));

import { handleApiCall, reportApiEventsFromServer, scrubEndpoint } from './error-handler';

/** What `Util.mustParse` throws when a success body is not the JSON the spec declares; recognised by NAME. */
function throwingUnparsable(url: string): () => Promise<never> {
  const error = Object.assign(new Error('Unable to parse response body as a service: Unexpected token <'), {
    name: 'ApiParseException',
    response: { status: 200, url, text: async () => '<html>502 Bad Gateway</html>' }
  });
  return () => Promise.reject(error);
}

/** A request that never got an answer, as the browser's fetch says it. */
function throwingNetwork(url: string): () => Promise<never> {
  return () => Promise.reject(new TypeError(`Failed to fetch ${url}`));
}

const reporter = vi.fn();

beforeEach(() => {
  reporter.mockClear();
  environment.browser = false;
  reportApiEventsFromServer(reporter);
});

describe('scrubEndpoint', () => {
  it.each([
    ['/login/reset-password/tok-1', '/login/reset-password/[redacted]'],
    ['/login/password/reset/tok-1', '/login/password/reset/[redacted]'],
    ['/welcome/tok-1', '/welcome/[redacted]'],
    ['https://api.test/activations/tok-1', 'https://api.test/activations/[redacted]'],
    ['https://api.test/email/verifications/tok-1?x=1', 'https://api.test/email/verifications/[redacted]?x=1']
  ])('redacts the token in %s', (url, expected) => {
    expect(scrubEndpoint(url)).toBe(expected);
  });

  it('leaves ordinary keys untouched', () => {
    expect(scrubEndpoint('https://api.test/apibuilder/organizations/bryzek')).toBe('https://api.test/apibuilder/organizations/bryzek');
    expect(scrubEndpoint('/login/reset-password')).toBe('/login/reset-password');
  });
});

describe('handleApiCall', () => {
  // Every call this app makes runs on the server, so the server reporter is the half that counts.
  it('reports a forced 502 once, as an unreadable response, with the endpoint scrubbed', async () => {
    const response = await handleApiCall(throwingUnparsable('https://api.test/activations/tok-1'));

    expect(response.status).toBe(502);
    expect(reporter).toHaveBeenCalledOnce();
    expect(reporter).toHaveBeenCalledWith(
      'api_unparsable_response',
      expect.objectContaining({ status: 502, endpoint: 'https://api.test/activations/[redacted]', browser_error_name: 'ApiParseException' })
    );
  });

  it('reports a forced status 0 once, as a network error, with the endpoint scrubbed', async () => {
    const response = await handleApiCall(throwingNetwork('https://api.test/email/verifications/tok-1'));

    expect(response.status).toBe(0);
    expect(reporter).toHaveBeenCalledOnce();
    expect(reporter).toHaveBeenCalledWith(
      'api_network_error',
      expect.objectContaining({
        status: 0,
        browser_error_name: 'TypeError',
        browser_error_message: 'Failed to fetch https://api.test/email/verifications/[redacted]'
      })
    );
  });

  it('reports nothing on success', async () => {
    await handleApiCall(() => Promise.resolve({ ok: true }));
    expect(reporter).not.toHaveBeenCalled();
  });

  it('warns rather than reporting when a call fails in the browser, which has no PostHog client', async () => {
    environment.browser = true;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await handleApiCall(throwingNetwork('https://api.test/x'));

    expect(reporter).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no browser PostHog client'), { event: 'api_network_error' });
    warn.mockRestore();
  });
});
