// dry-copy: sveltekit/screen-report/server-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import type { LoadEvent, RequestHandler, ServerLoadEvent } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { telemetryHandler } from './endpoint';
import { ctx, later } from './context';
import { decodeLogs } from './otlp.test.decode';
import { VIEW_HEADER, type CallContext } from './recorder';
import { clientRttOf, requestKind, screenReportHandle, screenViewId, viewIdFor, type HookEvent } from './server';
import { VIEW_COOKIE } from './view';

const VIEW = 'sv_0123456789abcdef0123456789abcdef';

function hookEvent(
  path: string,
  init: { method?: string; headers?: Record<string, string>; cookie?: string; isDataRequest?: boolean; route?: string | null } = {}
): HookEvent {
  return {
    url: new URL(`https://admin.test${path}`),
    request: new Request(`https://admin.test${path}`, { method: init.method ?? 'GET', headers: init.headers ?? {} }),
    route: { id: init.route === undefined ? '/issues/[id]' : init.route },
    locals: {},
    isDataRequest: init.isDataRequest ?? false,
    cookies: { get: (name) => (name === VIEW_COOKIE ? init.cookie : undefined) }
  };
}

function getIssue(context: CallContext): Promise<number> {
  return context.recorder.call(context, 'getIssue', async (note) => {
    note.response(new Response('{}'));
    return 1;
  });
}

describe('which view a request belongs to', () => {
  it('mints one for a document, whatever cookie it carries', () => {
    const event = hookEvent('/issues/1', { headers: { accept: 'text/html' }, cookie: VIEW });
    expect(requestKind(event)).toBe('document');
    expect(viewIdFor(event, 'document')).not.toBe(VIEW);
  });

  it("takes a soft navigation's id from the cookie an older bundle's beforeNavigate marked", () => {
    const event = hookEvent('/issues/1/__data.json', { isDataRequest: true, cookie: `${VIEW}.nav` });
    expect(requestKind(event)).toBe('data');
    expect(viewIdFor(event, 'data')).toBe(VIEW);
  });

  it('reads a data request under an unmarked cookie as a refresh of the view the page shows', () => {
    const event = hookEvent('/issues/1/__data.json', { isDataRequest: true, cookie: VIEW });
    expect(requestKind(event)).toBe('refresh');
    expect(viewIdFor(event, 'refresh')).toBe(VIEW);
  });

  it("takes a data request's view from its own header first, marked or not, whatever the cookie says", () => {
    const OTHER = 'sv_fedcba9876543210fedcba9876543210';
    const entering = hookEvent('/issues/1/__data.json', { isDataRequest: true, headers: { [VIEW_HEADER]: `${VIEW}.nav` }, cookie: OTHER });
    expect(requestKind(entering)).toBe('data');
    expect(viewIdFor(entering, 'data')).toBe(VIEW);
    const refresh = hookEvent('/issues/1/__data.json', { isDataRequest: true, headers: { [VIEW_HEADER]: VIEW }, cookie: `${OTHER}.nav` });
    expect(requestKind(refresh)).toBe('refresh');
    expect(viewIdFor(refresh, 'refresh')).toBe(VIEW);
  });

  it("takes a form action's view from its header before the cookie", () => {
    const OTHER = 'sv_fedcba9876543210fedcba9876543210';
    const event = hookEvent('/issues/1', { method: 'POST', headers: { 'x-sveltekit-action': 'true', [VIEW_HEADER]: VIEW }, cookie: OTHER });
    expect(viewIdFor(event, 'form')).toBe(VIEW);
  });

  it('mints a view for a data request with no cookie it can read', () => {
    for (const cookie of [{}, { cookie: 'sv_nope' }, { cookie: 'sv_nope.nav' }]) {
      const event = hookEvent('/issues/1/__data.json', { isDataRequest: true, ...cookie });
      expect(requestKind(event)).toBe('data');
      expect(viewIdFor(event, 'data')).toMatch(/^sv_[0-9a-f]{32}$/);
    }
  });

  it("takes an endpoint call's id from the page script's header, and records nothing without one", () => {
    const named = hookEvent('/search', { headers: { [VIEW_HEADER]: VIEW, accept: 'application/json' } });
    expect(requestKind(named)).toBe('endpoint');
    expect(viewIdFor(named, 'endpoint')).toBe(VIEW);
    expect(viewIdFor(hookEvent('/search', { cookie: VIEW }), 'endpoint')).toBeNull();
  });

  it('reads a form action as a form', () => {
    expect(requestKind(hookEvent('/issues/1', { method: 'POST', headers: { 'x-sveltekit-action': 'true' } }))).toBe('form');
  });
});

describe('the client round trip', () => {
  it("reads Cloudflare's TCP or QUIC round trip, from the platform or the request", () => {
    expect(clientRttOf({ cf: { clientTcpRtt: 42, clientQuicRtt: 0 } })).toBe(42);
    expect(clientRttOf({ cf: { clientTcpRtt: 0, clientQuicRtt: 753.4 } })).toBe(753);
    const request = Object.assign(new Request('https://admin.test/'), { cf: { clientTcpRtt: 61 } });
    expect(clientRttOf(undefined, request)).toBe(61);
  });

  it('is null off Cloudflare and where nothing was measured', () => {
    expect(clientRttOf(undefined)).toBeNull();
    expect(clientRttOf({ ctx: {} }, new Request('https://admin.test/'))).toBeNull();
    expect(clientRttOf({ cf: { clientTcpRtt: 0, clientQuicRtt: 0 } })).toBeNull();
    expect(clientRttOf({ cf: { clientTcpRtt: 'slow', clientQuicRtt: -1 } })).toBeNull();
  });
});

describe('screenReportHandle', () => {
  it('opens the view, and forwards the server half once every later part settles', async () => {
    const fetch = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 204 }));
    const handle = screenReportHandle({
      app: 'idempotent',
      repo: 'mbryzek/idempotent',
      token: () => 'tok',
      fetch: fetch as unknown as typeof globalThis.fetch
    });
    const waitUntil = vi.fn();
    const event = {
      ...hookEvent('/issues/1', { headers: { accept: 'text/html' } }),
      platform: { ctx: { waitUntil }, cf: { clientTcpRtt: 0, clientQuicRtt: 753 } }
    };
    let release: () => void = () => {};
    const response = await handle({
      event,
      resolve: async (e) => {
        await getIssue(ctx(e));
        void later(ctx(e), 'comments', async (c) => {
          await new Promise<void>((resolve) => (release = resolve));
          return getIssue(c);
        });
        return new Response('page');
      }
    });
    expect(await response.text()).toBe('page');
    expect(screenViewId(event)).toMatch(/^sv_/);
    expect(fetch).not.toHaveBeenCalled();
    release();
    await waitUntil.mock.calls[0]![0];
    const record = decodeLogs(fetch.mock.calls[0]![1]?.body as Uint8Array);
    expect(record.attributes['screen.report']).toBe('server');
    expect(record.attributes['screen.view']).toBe(screenViewId(event));
    expect(record.attributes['screen.navigation']).toBe('hard');
    expect(record.attributes['screen.load.calls']).toBe(1);
    expect(record.attributes['screen.later.max_calls']).toBe(1);
    expect(record.attributes['screen.client_rtt_ms']).toBe(753);
  });

  it("books a refresh's load calls as one tick of the view's refresh poll, and sends nothing for one with no call", async () => {
    const fetch = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 204 }));
    const handle = screenReportHandle({
      app: 'a',
      repo: 'mbryzek/a',
      token: () => 'tok',
      fetch: fetch as unknown as typeof globalThis.fetch
    });
    const waitUntil = vi.fn();
    const refresh = () => ({
      ...hookEvent('/issues/1/__data.json', { isDataRequest: true, cookie: VIEW }),
      platform: { ctx: { waitUntil } }
    });
    await handle({ event: refresh(), resolve: async () => new Response('{}') });
    await waitUntil.mock.calls[0]![0];
    expect(fetch).not.toHaveBeenCalled();
    await handle({
      event: refresh(),
      resolve: async (e) => {
        await getIssue(ctx(e));
        await getIssue(ctx(e));
        return new Response('{}');
      }
    });
    await waitUntil.mock.calls[1]![0];
    const record = decodeLogs(fetch.mock.calls[0]![1]?.body as Uint8Array);
    expect(record.attributes['screen.view']).toBe(VIEW);
    expect(record.attributes['screen.navigation']).toBeUndefined();
    expect(record.attributes['screen.load.calls']).toBe(0);
    expect(record.attributes['screen.poll.count']).toBe(1);
    expect(record.attributes['screen.poll.max_calls']).toBe(2);
  });

  it('leaves the telemetry route, skipped paths and unmatched routes alone', async () => {
    const handle = screenReportHandle({ app: 'a', repo: 'mbryzek/a', token: () => 'tok', skip: (path) => path.startsWith('/api/') });
    for (const event of [hookEvent('/_telemetry'), hookEvent('/api/issues'), hookEvent('/nowhere', { route: null })]) {
      await handle({ event, resolve: async () => new Response('ok') });
      expect(screenViewId(event)).toBeNull();
    }
  });
});
describe("SvelteKit's own types", () => {
  it('take the hook, the /_telemetry handler and ctx as they stand', () => {
    const config = { app: 'a', repo: 'mbryzek/a', token: () => undefined };
    expectTypeOf(screenReportHandle(config)).toExtend<Handle>();
    expectTypeOf(telemetryHandler(config)).toExtend<RequestHandler>();
    expectTypeOf<LoadEvent>().toExtend<Parameters<typeof ctx>[0]>();
    expectTypeOf<ServerLoadEvent>().toExtend<Parameters<typeof ctx>[0]>();
  });
});
// dry-copy-end
