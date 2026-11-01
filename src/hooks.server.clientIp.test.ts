import { describe, expect, it, vi } from 'vitest';

const upstream = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('{}', { status: 200 }));
vi.stubGlobal('fetch', upstream);

const { handle } = await import('./hooks.server.ts');
const { config } = await import('#lib/config.ts');

function run(getClientAddress: () => string, call = () => fetch(`${config.apiBaseUrl}/session`, { headers: { session_id: 'sess-1' } })) {
  const url = new URL('https://app.example/_internal_/version');
  const event = {
    url,
    request: new Request(url),
    route: { id: null },
    locals: {},
    cookies: { get: () => undefined, set: () => {}, delete: () => {} },
    getClientAddress
  };
  const resolve = async () => {
    await call();
    return new Response('ok');
  };
  return handle({ event, resolve } as unknown as Parameters<typeof handle>[0]);
}

function sentHeaders(): Record<string, string> {
  return upstream.mock.lastCall?.[1]?.headers as Record<string, string>;
}

// Without the header every user of this Worker shares one rate-limit bucket on the platform,
// keyed on Cloudflare's egress address. ISS-37007
describe('handle', () => {
  it("stamps a backend call made during a render with the browser's address", async () => {
    await run(() => '203.0.113.7');
    expect(sentHeaders()).toEqual({ session_id: 'sess-1', 'X-Worker-Client-IP': '203.0.113.7' });
  });

  it('stamps a Request, the form a client built with event.fetch reaches the global in', async () => {
    await run(
      () => '203.0.113.7',
      () => fetch(new Request(`${config.apiBaseUrl}/session`, { headers: { session_id: 'sess-1' } }))
    );
    const headers = upstream.mock.lastCall?.[1]?.headers as Headers;
    expect(headers.get('session_id')).toBe('sess-1');
    expect(headers.get('X-Worker-Client-IP')).toBe('203.0.113.7');
  });

  it('still renders where the adapter cannot name the address', async () => {
    const response = await run(() => {
      throw new Error('not available');
    });
    expect(await response.text()).toBe('ok');
    expect(sentHeaders()).toEqual({ session_id: 'sess-1' });
  });
});
