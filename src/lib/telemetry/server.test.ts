// dry-copy: sveltekit/screen-report/server-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import type { LoadEvent, RequestHandler, ServerLoadEvent } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { telemetryHandler } from './endpoint';
import { ctx, later } from './context';
import { decodeLogs } from './otlp.test.decode';
import { VIEW_HEADER, type CallContext } from './recorder';
import { LostHalves } from './report';
import {
  ABANDONED_AFTER_MS,
  Forwards,
  SETTLE_LIMIT_MS,
  clientMarksOf,
  clientNetworkOf,
  clientRttOf,
  EDGE_CLIENT_RTT_HEADER,
  keepAliveOf,
  requestKind,
  screenReportHandle,
  screenViewId,
  settledWithin,
  viewIdFor,
  type HookEvent
} from './server';
import { ViewRecorder } from './recorder';

const VIEW = 'sv_0123456789abcdef0123456789abcdef';

vi.mock('$app/env/public', () => ({ PUBLIC_VERSION: '0.3.97' }));

function hookEvent(
  path: string,
  init: { method?: string; headers?: Record<string, string>; isDataRequest?: boolean; route?: string | null } = {}
): HookEvent {
  return {
    url: new URL(`https://admin.test${path}`),
    request: new Request(`https://admin.test${path}`, { method: init.method ?? 'GET', headers: init.headers ?? {} }),
    route: { id: init.route === undefined ? '/issues/[id]' : init.route },
    locals: {},
    isDataRequest: init.isDataRequest ?? false
  };
}

function getIssue(context: CallContext): Promise<number> {
  return context.recorder.call(context, 'getIssue', async (note) => {
    note.response(new Response('{}'));
    return 1;
  });
}

describe('which view a request belongs to', () => {
  it('mints one for a document, whatever view header it carries', () => {
    const event = hookEvent('/issues/1', { headers: { accept: 'text/html', [VIEW_HEADER]: VIEW } });
    expect(requestKind(event)).toBe('document');
    expect(viewIdFor(event, 'document')).not.toBe(VIEW);
  });

  it("takes a soft navigation's id from the header its beforeNavigate marked", () => {
    const event = hookEvent('/issues/1/__data.json', { isDataRequest: true, headers: { [VIEW_HEADER]: `${VIEW}.nav` } });
    expect(requestKind(event)).toBe('data');
    expect(viewIdFor(event, 'data')).toBe(VIEW);
  });

  it('reads a data request under an unmarked header as a refresh of the view the page shows', () => {
    const event = hookEvent('/issues/1/__data.json', { isDataRequest: true, headers: { [VIEW_HEADER]: VIEW } });
    expect(requestKind(event)).toBe('refresh');
    expect(viewIdFor(event, 'refresh')).toBe(VIEW);
  });

  it("takes a form action's view from its header, and records nothing without one", () => {
    const event = hookEvent('/issues/1', { method: 'POST', headers: { 'x-sveltekit-action': 'true', [VIEW_HEADER]: VIEW } });
    expect(viewIdFor(event, 'form')).toBe(VIEW);
    expect(viewIdFor(hookEvent('/issues/1', { method: 'POST', headers: { 'x-sveltekit-action': 'true' } }), 'form')).toBeNull();
  });

  it('mints a view for a data request with no header it can read', () => {
    for (const headers of [{}, { [VIEW_HEADER]: 'sv_nope' }, { [VIEW_HEADER]: 'sv_nope.nav' }]) {
      const event = hookEvent('/issues/1/__data.json', { isDataRequest: true, headers });
      expect(requestKind(event)).toBe('data');
      expect(viewIdFor(event, 'data')).toMatch(/^sv_[0-9a-f]{32}$/);
    }
  });

  it("takes an endpoint call's id from the page script's header, and records nothing without one", () => {
    const named = hookEvent('/search', { headers: { [VIEW_HEADER]: VIEW, accept: 'application/json' } });
    expect(requestKind(named)).toBe('endpoint');
    expect(viewIdFor(named, 'endpoint')).toBe(VIEW);
    expect(viewIdFor(hookEvent('/search'), 'endpoint')).toBeNull();
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

  it("reads the round trip an edge Worker carried on, when the request is the edge's subrequest", () => {
    const passedOn = (headers: Record<string, string>) =>
      Object.assign(new Request('https://admin.test/', { headers }), { cf: { clientTcpRtt: 0, clientQuicRtt: 0 } });
    expect(clientRttOf(undefined, passedOn({ 'cf-worker': 'idempotent.app', [EDGE_CLIENT_RTT_HEADER]: '88' }))).toBe(88);
    expect(clientRttOf({ cf: { clientTcpRtt: 0 } }, passedOn({ 'cf-worker': 'idempotent.app', [EDGE_CLIENT_RTT_HEADER]: '88' }))).toBe(88);
    expect(clientRttOf({ cf: { clientTcpRtt: 30 } }, passedOn({ 'cf-worker': 'idempotent.app', [EDGE_CLIENT_RTT_HEADER]: '88' }))).toBe(30);
    expect(clientRttOf(undefined, passedOn({ [EDGE_CLIENT_RTT_HEADER]: '88' }))).toBeNull();
    expect(clientRttOf(undefined, passedOn({ 'cf-worker': 'idempotent.app', [EDGE_CLIENT_RTT_HEADER]: 'slow' }))).toBeNull();
    expect(clientRttOf(undefined, passedOn({ 'cf-worker': 'idempotent.app', [EDGE_CLIENT_RTT_HEADER]: '-4' }))).toBeNull();
  });

  it('is null off Cloudflare and where nothing was measured', () => {
    expect(clientRttOf(undefined)).toBeNull();
    expect(clientRttOf({ ctx: {} }, new Request('https://admin.test/'))).toBeNull();
    expect(clientRttOf({ cf: { clientTcpRtt: 0, clientQuicRtt: 0 } })).toBeNull();
    expect(clientRttOf({ cf: { clientTcpRtt: 'slow', clientQuicRtt: -1 } })).toBeNull();
  });
});

describe("the client's marks", () => {
  const request = (agent?: string) => new Request('https://admin.test/', agent === undefined ? {} : { headers: { 'user-agent': agent } });
  const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';

  it("hashes a person's browser's user agent and marks nothing", () => {
    const marks = clientMarksOf(request(chrome));
    expect(marks.automated).toBeUndefined();
    expect(marks.agent).toMatch(/^[0-9a-f]{8}$/);
    expect(clientMarksOf(request(chrome)).agent).toBe(marks.agent);
    expect(clientMarksOf(request(chrome.replace('117', '33'))).agent).not.toBe(marks.agent);
  });

  it('marks an automation named in the user agent, a missing user agent, and a webdriver claim', () => {
    for (const agent of [
      chrome.replace('Chrome/', 'HeadlessChrome/'),
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)',
      'curl/8.4.0',
      'python-requests/2.31.0'
    ]) {
      expect(clientMarksOf(request(agent)).automated, agent).toBe('user-agent');
    }
    expect(clientMarksOf(request()).automated).toBe('user-agent');
    expect(clientMarksOf(request()).agent).toBeUndefined();
    expect(clientMarksOf(request(chrome), true).automated).toBe('webdriver');
  });

  it('marks no phone whose model ends in bot', () => {
    expect(
      clientMarksOf(request('Mozilla/5.0 (Linux; Android 12; CUBOT_X30 Build/SP1A) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'))
        .automated
    ).toBeUndefined();
  });
});

describe("the client's network", () => {
  const cf = { asn: 396982, asOrganization: 'Google LLC' };

  it("reads the autonomous system Cloudflare saw from the platform's cf, else the request's own", () => {
    expect(clientNetworkOf({ cf: cf })).toEqual({ asn: 396982, as_org: 'Google LLC' });
    expect(clientNetworkOf(undefined, Object.assign(new Request('https://admin.test/'), { cf: { asn: 7922 } }))).toEqual({ asn: 7922 });
  });

  it("carries nothing off Cloudflare, nothing malformed, and never a Worker subrequest's own network", () => {
    expect(clientNetworkOf(undefined, new Request('https://admin.test/'))).toEqual({});
    expect(clientNetworkOf({ cf: { asn: 0, asOrganization: ' ' } })).toEqual({});
    expect(clientNetworkOf({ cf: { asn: '396982', asOrganization: 42 } })).toEqual({});
    expect(clientNetworkOf({ cf: { asn: 13335.5 } })).toEqual({});
    expect(clientNetworkOf({ cf: { asOrganization: 'x'.repeat(300) } }).as_org).toHaveLength(100);
    const passedOn = new Request('https://admin.test/', { headers: { 'cf-worker': 'idempotent.app' } });
    expect(clientNetworkOf({ cf: cf }, passedOn)).toEqual({});
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
      ...hookEvent('/issues/1', { headers: { accept: 'text/html', 'user-agent': 'HeadlessChrome/150' } }),
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
    expect(record.attributes['screen.client.automated']).toBe('user-agent');
    expect(record.attributes['screen.client.agent']).toMatch(/^[0-9a-f]{8}$/);
    expect(record.attributes['screen.release']).toBe('0.3.97');
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
      ...hookEvent('/issues/1/__data.json', { isDataRequest: true, headers: { [VIEW_HEADER]: VIEW } }),
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
    expect(record.attributes['screen.poll.refresh.count']).toBe(1);
    expect(record.attributes['screen.poll.max_calls']).toBe(2);
  });

  it("keeps the Worker alive with the app's waitUntil where the platform carries none", async () => {
    const fetch = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 204 }));
    const waitUntil = vi.fn();
    const handle = screenReportHandle({
      app: 'a',
      repo: 'mbryzek/a',
      token: () => 'tok',
      fetch: fetch as unknown as typeof globalThis.fetch,
      waitUntil
    });
    const event = hookEvent('/issues/1', { headers: { accept: 'text/html' } });
    await handle({ event, resolve: async () => new Response('page') });
    expect(waitUntil).toHaveBeenCalledTimes(1);
    await waitUntil.mock.calls[0]![0];
    const record = decodeLogs(fetch.mock.calls[0]![1]?.body as Uint8Array);
    expect(record.attributes['screen.navigation']).toBe('hard');
  });

  it('leaves the telemetry route, skipped paths and unmatched routes alone', async () => {
    const handle = screenReportHandle({ app: 'a', repo: 'mbryzek/a', token: () => 'tok', skip: (path) => path.startsWith('/api/') });
    for (const event of [hookEvent('/_telemetry'), hookEvent('/api/issues'), hookEvent('/nowhere', { route: null })]) {
      await handle({ event, resolve: async () => new Response('ok') });
      expect(screenViewId(event)).toBeNull();
    }
  });
});
describe('what keeps the server half alive', () => {
  it("prefers the platform's waitUntil, then the app's", async () => {
    const platform = vi.fn();
    const app = vi.fn();
    const promise = Promise.resolve();
    (await keepAliveOf({ ctx: { waitUntil: platform } }, { waitUntil: app }))?.(promise);
    expect(platform).toHaveBeenCalledWith(promise);
    expect(await keepAliveOf(undefined, { waitUntil: app })).toBe(app);
  });

  // Each app's test run decides what `cloudflare:workers` is (a stub of its own, adapter-cloudflare's
  // stand-in, or nothing), so the fallback is measured against whichever this run loads.
  it("falls back to the Worker's own waitUntil, and is null off Cloudflare", async () => {
    const worker = await import('cloudflare:workers' as string).then(
      (module: { waitUntil?: unknown }) => module.waitUntil,
      () => undefined
    );
    const fallback = await keepAliveOf(undefined, {});
    expect(fallback === null).toBe(typeof worker !== 'function');
  });

  it('stops waiting on a later part that never settles', async () => {
    vi.useFakeTimers();
    try {
      const view = new ViewRecorder(VIEW, '/issues/[id]', { side: 'server' });
      view.pend(new Promise(() => {}));
      let done = false;
      const waited = settledWithin(view).then(() => (done = true));
      await vi.advanceTimersByTimeAsync(SETTLE_LIMIT_MS - 1);
      expect(done).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await waited;
      expect(done).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('counts a forward its Worker abandoned as lost when the next one starts', () => {
    let now = 0;
    const lost = new LostHalves();
    const forwards = new Forwards(lost, () => now);
    const finished = forwards.start();
    forwards.start();
    finished();
    now = ABANDONED_AFTER_MS;
    forwards.start();
    expect(lost.pending()).toBe(1);
    forwards.start();
    expect(lost.pending()).toBe(1);
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
