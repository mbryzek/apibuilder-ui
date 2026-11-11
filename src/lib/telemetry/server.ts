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
 * - a `__data.json` request is a soft navigation's server half, and takes the id the browser wrote
 *   to the `sv` cookie in `beforeNavigate`;
 * - a form action or an app endpoint takes the id the page's script sent as `x-screen-view-id`
 *   (or, for a form, the cookie). One that names no view records nothing: it is not a screen's.
 *
 * The half is forwarded in process, never through a rate-limited route, and on Cloudflare through
 * the request's `waitUntil` so the Worker lives until the post is made. A failed send is dropped.
 */
import { getRequestEvent } from '$app/server';
import { budgetFor, type BudgetTable } from './budget';
import { setViewLookup, viewOfLocals } from './context';
import { VIEW_HEADER, ViewRecorder } from './recorder';
import { halfOf, postReport, type ReportDoor, type ServerRequest } from './report';
import { VIEW_COOKIE, isViewId, mintViewId } from './view';

/** One app's screen report: where its halves go, and what it holds its screens to. */
export interface ScreenReportConfig extends ReportDoor {
  budgets?: BudgetTable;
  /** Same-origin paths that are not a screen's (an API proxy the browser half already counts). */
  skip?: (pathname: string) => boolean;
}

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

/** What request `event` is, as far as the report cares. */
export function requestKind(event: HookEvent): ServerRequest {
  if (event.isDataRequest) return 'data';
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
  const header = event.request.headers.get(VIEW_HEADER);
  if (isViewId(header)) return header;
  if (kind === 'endpoint') return null;
  const cookie = event.cookies.get(VIEW_COOKIE);
  if (isViewId(cookie)) return cookie;
  return kind === 'data' ? mintViewId() : null;
}

/** The request's own `waitUntil` on Cloudflare (`platform.ctx` or `platform.context`), when it has one. */
export function waitUntilOf(platform: unknown): ((promise: Promise<unknown>) => void) | null {
  const holder = platform as
    { ctx?: { waitUntil?: (p: Promise<unknown>) => void }; context?: { waitUntil?: (p: Promise<unknown>) => void } } | undefined;
  const owner = holder?.ctx ?? holder?.context;
  const waitUntil = owner?.waitUntil;
  return typeof waitUntil === 'function' ? (promise) => waitUntil.call(owner, promise) : null;
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

/** Forward the half once the view's later parts settle. A document or data request reports even with no call. */
async function forward(view: ViewRecorder, kind: ServerRequest, config: ScreenReportConfig, clientRtt: number | null): Promise<void> {
  await view.settled();
  const half = halfOf(view, { request: kind, client_rtt_ms: clientRtt });
  if (half.calls.length === 0 && half.dropped_calls === 0 && kind !== 'document' && kind !== 'data') return;
  await postReport(half, budgetFor(view.route, config.budgets), config);
}

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
      const sent = forward(view, kind, config, clientRttOf(event.platform, event.request)).catch(() => undefined);
      waitUntilOf(event.platform)?.(sent);
    }
    return response;
  };
}
// dry-copy-end
