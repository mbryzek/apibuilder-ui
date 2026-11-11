// dry-copy: sveltekit/screen-report/server — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The server half of the screen report: the hook that opens a request's screen view and forwards
 * what the server's calls cost once the load and every later part settle.
 *
 * An app's `hooks.server.ts` puts it in its `sequence`, and its root `+layout.server.ts` hands the
 * view id to the browser, which adopts it on hydration:
 *
 *     export const handle = sequence(screenReportHandle(screenReport), ...);
 *     // +layout.server.ts
 *     return { screenView: screenViewId(event), ... };
 *
 * where `screenReport` is the app's one `ScreenReportConfig`: its name, its budget table
 * (`budget.ts`), the Worker secret `OBS_REPORT_TOKEN`, and the same-origin paths that are not
 * screens (an API proxy). The same config builds `/_telemetry` (`endpoint.ts`).
 *
 * WHICH VIEW A REQUEST BELONGS TO:
 *
 * - a document request mints a view (a hard load);
 * - a `__data.json` request takes the view its `x-screen-view-id` header names (`view.ts`), or,
 *   with no header, the `sv` cookie an older browser bundle writes. Marked as a navigation, it is a
 *   soft navigation's server half; unmarked, it is a refresh of the view the page shows
 *   (`invalidate`, a poll, the reload after a form action), and its load's calls are one tick of
 *   that view's `refresh` poll, never a second first load. Naming no view, it mints one;
 * - a form action or an app endpoint takes the id the page's script sent as `x-screen-view-id`
 *   (or, for a form, the cookie). One that names no view records nothing: it is not a screen's.
 *
 * The half is forwarded in process, never through a rate-limited route, and on Cloudflare through
 * the request's `waitUntil` so the Worker lives until the post is made (`keepAliveOf`). The wait on
 * the later parts is bounded (`SETTLE_LIMIT_MS`), so a part that never settles still sends what the
 * view holds. A failed send, and a post the Worker abandoned before making it, is counted on the next
 * half delivered (`screen.report.lost`).
 */
import { getRequestEvent } from '$app/server';
import { budgetFor, type BudgetTable } from './budget';
import { setViewLookup, viewOfLocals } from './context';
import { VIEW_HEADER, ViewRecorder } from './recorder';
import {
  REFRESH_POLL,
  halfOf,
  lostHalves,
  postReport,
  type LostHalves,
  type ReportDoor,
  type ReportHalf,
  type ServerRequest
} from './report';
import { VIEW_COOKIE, mintViewId, readViewMark } from './view';

/** One app's screen report: where its halves go, and what it holds its screens to. */
export interface ScreenReportConfig extends ReportDoor {
  budgets?: BudgetTable;
  /** Same-origin paths that are not a screen's (an API proxy the browser half already counts). */
  skip?: (pathname: string) => boolean;
  /** Keeps the Worker alive for a promise where the request's platform carries no `waitUntil`; `cloudflare:workers`' own by default. */
  waitUntil?: KeepAlive;
}

/** Keeps the runtime alive until a promise settles. */
export type KeepAlive = (promise: Promise<unknown>) => void;

/** The path the browser half is posted to, in every app. */
export const TELEMETRY_PATH = '/_telemetry';

/** The fields of a request event the hook reads and writes, declared by shape. */
export interface HookEvent {
  url: URL;
  request: Request;
  route: { id: string | null };
  locals: object;
  isDataRequest: boolean;
  cookies: { get(name: string): string | undefined };
  platform?: unknown;
}

// A universal load running on the server holds no `locals`; it finds its view through the request.
setViewLookup(() => {
  try {
    return viewOfLocals(getRequestEvent().locals);
  } catch {
    return undefined;
  }
});

export { REFRESH_POLL } from './report';

/**
 * The view `event` names and whether a navigation is entering it: its `x-screen-view-id` header,
 * else, where `cookie` allows, the `sv` cookie. A header always wins: it is the requesting
 * document's own, the cookie is the origin's.
 */
export function viewMarkOf(event: HookEvent, cookie = true): { view: string; navigation: boolean } | null {
  const header = event.request.headers.get(VIEW_HEADER);
  if (header !== null) return readViewMark(header);
  return cookie ? readViewMark(event.cookies.get(VIEW_COOKIE)) : null;
}

/** What request `event` is, as far as the report cares. */
export function requestKind(event: HookEvent): ServerRequest {
  if (event.isDataRequest) return viewMarkOf(event)?.navigation === false ? 'refresh' : 'data';
  const method = event.request.method;
  const accept = event.request.headers.get('accept') ?? '';
  const dest = event.request.headers.get('sec-fetch-dest');
  if (method === 'GET' || method === 'HEAD') {
    return dest === 'document' || accept.includes('text/html') ? 'document' : 'endpoint';
  }
  return event.request.headers.has('x-sveltekit-action') || accept.includes('text/html') ? 'form' : 'endpoint';
}

/** The view `event` belongs to: minted for a document, else the one the browser named, else none. */
export function viewIdFor(event: HookEvent, kind: ServerRequest): string | null {
  if (kind === 'document') return mintViewId();
  const mark = viewMarkOf(event, kind !== 'endpoint');
  if (mark !== null) return mark.view;
  return kind === 'data' ? mintViewId() : null;
}

/** The request's own `waitUntil` on Cloudflare (`platform.ctx` or `platform.context`), when it has one. */
export function waitUntilOf(platform: unknown): KeepAlive | null {
  const holder = platform as
    { ctx?: { waitUntil?: (p: Promise<unknown>) => void }; context?: { waitUntil?: (p: Promise<unknown>) => void } } | undefined;
  const owner = holder?.ctx ?? holder?.context;
  const waitUntil = owner?.waitUntil;
  return typeof waitUntil === 'function' ? (promise) => waitUntil.call(owner, promise) : null;
}

/**
 * The Worker's own `waitUntil`, from `cloudflare:workers`, which keeps the request that is running
 * alive: adapter-cloudflare hands SvelteKit no `platform` at all, so without it the server half's
 * post was abandoned as the response ended (ISS-77398). Null off Cloudflare, where the module does
 * not exist. Imported by a specifier the type checker does not resolve, so an app without Workers
 * types still checks; the bundler still sees the literal and leaves it to the Worker.
 */
const workerWaitUntil: Promise<KeepAlive | null> = import('cloudflare:workers' as string).then(
  (module: { waitUntil?: unknown }) => {
    const waitUntil = module.waitUntil;
    return typeof waitUntil === 'function' ? (promise: Promise<unknown>) => void waitUntil(promise) : null;
  },
  () => null
);

/** What keeps the Worker alive for a request's post: the platform's `waitUntil`, else the app's, else the Worker's own. */
export async function keepAliveOf(platform: unknown, config: { waitUntil?: KeepAlive }): Promise<KeepAlive | null> {
  return waitUntilOf(platform) ?? config.waitUntil ?? (await workerWaitUntil);
}

/** Cloudflare's per-request connection facts (`request.cf`), the two round trips the report reads. */
interface ClientConnection {
  clientTcpRtt?: unknown;
  clientQuicRtt?: unknown;
}

/**
 * The round trip, in ms, Cloudflare measured to the client on this request: `clientTcpRtt` over
 * TCP, `clientQuicRtt` over HTTP/3, each 0 or absent when the request did not come that way. Read
 * from `platform.cf` (SvelteKit's adapter) or the request's own `cf`; null off Cloudflare. A
 * screen's time to show is several round trips, so the rules read it to tell a slow network from
 * a slow screen (ISS-76085).
 */
export function clientRttOf(platform: unknown, request?: Request): number | null {
  const cf = (platform as { cf?: ClientConnection } | undefined)?.cf ?? (request as { cf?: ClientConnection } | undefined)?.cf;
  const rtts = [cf?.clientTcpRtt, cf?.clientQuicRtt].filter(
    (rtt): rtt is number => typeof rtt === 'number' && Number.isFinite(rtt) && rtt > 0
  );
  return rtts.length === 0 ? null : Math.round(Math.max(...rtts));
}

/** The view id a hard load's root layout hands the browser; null for a request with no view. */
export function screenViewId(event: { locals: object }): string | null {
  return viewOfLocals(event.locals)?.view ?? null;
}

function skipped(event: HookEvent, config: ScreenReportConfig): boolean {
  const path = event.url.pathname;
  return event.route.id === null || path === TELEMETRY_PATH || (config.skip?.(path) ?? false);
}

/** A refresh's half: its load's calls are one tick of the view's `refresh` poll, which its view already loaded once. */
export function asRefresh(half: ReportHalf): ReportHalf {
  const part = `poll:${REFRESH_POLL}`;
  return {
    ...half,
    calls: half.calls.map((call) => (call.part === 'load' ? { ...call, part } : call)),
    polls: { ...half.polls, [REFRESH_POLL]: (half.polls[REFRESH_POLL] ?? 0) + 1 }
  };
}

/**
 * The longest the server half waits on the view's later parts. Cloudflare keeps a Worker alive for
 * 30 s after its response for `waitUntil`; past this the half is sent with what the view holds, a
 * call still open carrying no end, rather than lost with the Worker.
 */
export const SETTLE_LIMIT_MS = 20_000;
/** A forward that has not finished by this age was abandoned with its Worker: the settle limit, the post's own timeout, and slack. */
export const ABANDONED_AFTER_MS = SETTLE_LIMIT_MS + 10_000;

/** Resolves once every later part of `view` has settled, or after `limitMs`, whichever is first. */
export async function settledWithin(view: ViewRecorder, limitMs: number = SETTLE_LIMIT_MS): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limit = new Promise<void>((resolve) => (timer = setTimeout(resolve, limitMs)));
  try {
    await Promise.race([view.settled(), limit]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The forwards this isolate has started and not finished. One that outlives `ABANDONED_AFTER_MS`
 * never will: its Worker ended first, and it is counted lost when the next forward starts.
 */
export class Forwards {
  private readonly open = new Map<object, number>();

  constructor(
    private readonly lost: LostHalves = lostHalves,
    private readonly clock: () => number = Date.now
  ) {}

  /** A forward starts; returns what finishes it. */
  start(): () => void {
    const now = this.clock();
    for (const [key, startedAt] of this.open) {
      if (now - startedAt < ABANDONED_AFTER_MS) continue;
      this.open.delete(key);
      this.lost.lose();
    }
    const key = {};
    this.open.set(key, now);
    return () => void this.open.delete(key);
  }
}

const forwards = new Forwards();

/** Forward the half once the view's later parts settle. A document or data request reports even with no call. */
async function forward(view: ViewRecorder, kind: ServerRequest, config: ScreenReportConfig, clientRtt: number | null): Promise<void> {
  await settledWithin(view);
  const taken = halfOf(view, { request: kind, client_rtt_ms: clientRtt });
  const half = kind === 'refresh' ? asRefresh(taken) : taken;
  if (half.calls.length === 0 && half.dropped_calls === 0 && kind !== 'document' && kind !== 'data') return;
  await postReport(half, budgetFor(view.route, config.budgets), config);
}

let warnedNoKeepAlive = false;

/** The `handle` that opens each request's screen view and forwards its server half. */
export function screenReportHandle(
  config: ScreenReportConfig
): <E extends HookEvent>(input: { event: E; resolve: (event: E) => Promise<Response> }) => Promise<Response> {
  return async ({ event, resolve }) => {
    if (skipped(event, config)) return resolve(event);
    let view: ViewRecorder | null = null;
    let kind: ServerRequest = 'endpoint';
    try {
      kind = requestKind(event);
      const id = viewIdFor(event, kind);
      if (id !== null) {
        view = new ViewRecorder(id, event.route.id, { side: 'server', clock: Date.now });
        (event.locals as { screenView?: ViewRecorder }).screenView = view;
      }
    } catch {
      view = null;
    }
    const response = await resolve(event);
    if (view !== null) {
      const keepAlive = await keepAliveOf(event.platform, config);
      if (keepAlive === null && !warnedNoKeepAlive) {
        warnedNoKeepAlive = true;
        console.warn('screen report: nothing keeps this runtime alive for the server half; a half may be lost as the response ends');
      }
      const finish = forwards.start();
      const sent = forward(view, kind, config, clientRttOf(event.platform, event.request))
        .catch(() => undefined)
        .finally(finish);
      keepAlive?.(sent);
    }
    return response;
  };
}
// dry-copy-end
