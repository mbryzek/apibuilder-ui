// dry-copy: sveltekit/screen-report/browser — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The browser half of the screen report. The root layout registers it once, during component init,
 * with the view id its server load handed over (`screenViewId` in `server.ts`):
 *
 *     registerScreenReport({ view: data.screenView });
 *
 * It holds the browser's current view: the hard load's, adopted from the page data on hydration,
 * then each soft navigation's, minted in `beforeNavigate`. Every data request and form action the
 * document sends through `fetch` names it in the `x-screen-view-id` header (`view.ts`): marked as a
 * navigation from `beforeNavigate` until `afterNavigate`, so the server half of that navigation's
 * data request carries the same id, and unmarked otherwise, so a refresh's data request
 * (`invalidate`, the reload after a form action) is booked to the view the page shows. The header is
 * the document's own, so two windows of an app each book to their own view. A universal load or a
 * component call in the browser finds its view here (`ctx`, `viewCtx`).
 *
 * A navigation another `beforeNavigate` handler cancels (an unsaved-changes guard) never enters
 * its view: the view it would have left stays current, as if it had not started.
 *
 * A universal load that runs after its view is entered is a refresh of that view (`invalidate`, a
 * poll, the reload after a form action), never a second first load: each such load run is one tick
 * of the view's `refresh` poll and its calls are part `poll:refresh`, as the server half books a
 * refresh's data request (`asRefresh` in `server.ts`).
 *
 * The half carries every call the browser made in the view and its timing, and is sent ONCE by
 * `sendBeacon` to `/_telemetry` when the view ends: taken in `beforeNavigate` and sent once the
 * navigation goes ahead for a view a soft navigation leaves, and at the first `visibilitychange`
 * to hidden or `pagehide` for the document's last view. Interaction after that send (INP) is lost, which the report accepts. Telemetry never
 * breaks a page: every browser API here is guarded, and a failed send is dropped.
 */
import { browser } from '$app/env';
import { afterNavigate, beforeNavigate } from '$app/navigation';
import { page } from '$app/state';
import { setViewLookup } from './context';
import { VIEW_HEADER, ViewRecorder, type CallContext, type CallNote } from './recorder';
import { REFRESH_POLL, halfOf, type ReportTiming } from './report';
import {
  VisibleStopwatch,
  documentStart,
  hardLoadShowMs,
  hiddenSpansAtRegistration,
  interactionToNextPaint,
  loadPhases,
  softNavigationShowMs,
  type HiddenSpans,
  type InteractionEntry,
  type VisibilityStateEntry
} from './timing';
import { VIEW_COOKIE, isViewId, mintViewId, viewMark } from './view';

/** Where the browser half is posted. */
export const TELEMETRY_ENDPOINT = '/_telemetry';

/** The slowest an interaction can be and still go unrecorded: the `event` entries' own floor. */
const EVENT_THRESHOLD_MS = 40;
/** Interactions kept per view; past it INP reads the ones kept. */
const MAX_INTERACTIONS = 500;

/**
 * The browser's recorder of one view. A `load` context it first sees after the view is entered is a
 * load re-run: one tick of the `refresh` poll, its calls booked as `poll:refresh`. A load context
 * first seen before entry (the navigation's own load, a hard load's hydration replay) stays `load`.
 */
export class BrowserViewRecorder extends ViewRecorder {
  /** The view's own clock reading at `afterNavigate`; a hard load's browser `load` calls before it are hydration replays. */
  enteredAt: number | null = null;
  /** Each load context's booking, decided the first time it is seen: its refresh context, or null to keep it `load`. */
  private readonly bookings = new WeakMap<object, CallContext | null>();

  private bookedAs(context: CallContext): CallContext {
    if (context.part !== 'load') return context;
    try {
      let booked = this.bookings.get(context);
      if (booked === undefined) {
        booked = this.enteredAt === null ? null : { ...context, part: `poll:${REFRESH_POLL}` };
        if (booked !== null) this.pollTick(REFRESH_POLL);
        this.bookings.set(context, booked);
      }
      return booked ?? context;
    } catch {
      return context;
    }
  }

  override call<T>(context: CallContext, operation: string, run: (note: CallNote) => Promise<T>): Promise<T> {
    return super.call(this.bookedAs(context), operation, run);
  }

  override parentAwaited(context: object): void {
    super.parentAwaited(this.bookedAs(context as CallContext));
  }
}

/** One screen view as the browser holds it. */
interface ViewState {
  recorder: BrowserViewRecorder;
  navigation: 'hard' | 'soft';
  /** The page the view shows (`pageOf`), which a refresh's data request reloads; null where the navigation named none. */
  page: string | null;
  showMs: number | null;
  finishedMs: number | null;
  interactions: InteractionEntry[];
  /** The browser's `interactionCount` when the view began; null where it keeps none. */
  interactionCountAt: number | null;
  sent: boolean;
}

export interface ScreenReportOptions {
  /** The view id the root layout's server load handed over; a page with none mints its own. */
  view: string | null | undefined;
  endpoint?: string;
}

/** What SvelteKit appends to a page's path for its data request. */
const DATA_SUFFIX = '/__data.json';

let current: ViewState | null = null;
/** The view a soft navigation is leaving, and its half as of `beforeNavigate`; null once the navigation commits or is cancelled. */
let leaving: { view: ViewState; half: ReturnType<typeof browserHalfOf> } | null = null;
const softNav = new VisibleStopwatch();
let documentHidden: HiddenSpans | null = null;
let lcpAt: number | null = null;

/**
 * The document's interaction count so far (`performance.interactionCount`, Chromium); null where the
 * browser keeps none.
 */
function interactionCount(): number | null {
  try {
    const count = (performance as Performance & { interactionCount?: unknown }).interactionCount;
    return typeof count === 'number' && Number.isFinite(count) && count >= 0 ? count : null;
  } catch {
    return null;
  }
}

/** Interactions in `view` so far, by the browser's count; null where it keeps none. */
function interactionsSince(view: ViewState): number | null {
  const now = interactionCount();
  return now === null || view.interactionCountAt === null ? null : Math.max(0, now - view.interactionCountAt);
}

function newView(id: string, route: string | null, url: URL | null, navigation: 'hard' | 'soft', startedAt: number): ViewState {
  const count = interactionCount();
  return {
    recorder: new BrowserViewRecorder(id, route, { side: 'browser', startedAt, origin: location.origin }),
    navigation,
    page: url === null ? null : pageOf(url.pathname, url.search),
    showMs: null,
    finishedMs: null,
    interactions: [],
    // A hard load's view is the document's from its start: every interaction the browser counted is its.
    interactionCountAt: count === null ? null : navigation === 'hard' ? 0 : count,
    sent: false
  };
}

function navigationEntry(): PerformanceNavigationTiming | undefined {
  return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
}

function visibilityTimeline(): VisibilityStateEntry[] | null {
  if (typeof PerformanceObserver === 'undefined') return null;
  if (!(PerformanceObserver.supportedEntryTypes ?? []).includes('visibility-state')) return null;
  return performance.getEntriesByType('visibility-state');
}

function observe(type: string, onEntries: (entries: PerformanceEntry[]) => void, options: Record<string, unknown> = {}): void {
  try {
    new PerformanceObserver((list) => onEntries(list.getEntries())).observe({ type, buffered: true, ...options });
  } catch {
    // A browser that refuses the observer reports less.
  }
}

/** The view's timing as of now. */
export function timingOf(view: ViewState, now: number): ReportTiming {
  const nav = view.navigation === 'hard' ? navigationEntry() : undefined;
  const show = nav === undefined ? view.showMs : hardLoadShowMs(lcpAt, documentStart(nav), documentHidden, now);
  return {
    navigation: view.navigation,
    show_ms: show,
    inp_ms: interactionToNextPaint(view.interactions, interactionsSince(view)),
    finished_ms: view.finishedMs,
    ...(nav === undefined ? {} : { phases: loadPhases(nav, lcpAt, documentHidden, now) })
  };
}

/** The half to send: a hard load's `load` calls before hydration finished are replays the server half already holds. */
export function browserHalfOf(view: ViewState, now: number): ReturnType<typeof halfOf> {
  const half = halfOf(view.recorder, { timing: timingOf(view, now) });
  const entered = view.recorder.enteredAt;
  if (view.navigation !== 'hard' || entered === null) return half;
  return { ...half, calls: half.calls.filter((call) => !(call.part === 'load' && call.start_ms <= entered)) };
}

/**
 * Whether `fetch(input, init)` is one of the document's own requests a view's server half answers:
 * a same-origin `__data.json` GET (a navigation or a refresh) or a form action (`use:enhance`).
 */
export function namesView(input: RequestInfo | URL, init: RequestInit | undefined): boolean {
  const request = typeof Request !== 'undefined' && input instanceof Request ? input : null;
  const url = new URL(request?.url ?? String(input), location.href);
  if (url.origin !== location.origin) return false;
  const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
  if (method === 'GET') return url.pathname.endsWith(DATA_SUFFIX);
  return new Headers(init?.headers ?? request?.headers).has('x-sveltekit-action');
}

/** SvelteKit's own query parameters on a data request (`x-sveltekit-invalidated`, `x-sveltekit-trailing-slash`), which name no page. */
const SVELTEKIT_PARAM = 'x-sveltekit-';

/**
 * The page `path` and `search` name: the path without a trailing slash, the root excepted, the way
 * SvelteKit names a page's data request, and the query without SvelteKit's own parameters, sorted.
 * The query is part of the page: a filter or pager link changes only it, and its preload loads a
 * different page of the same route. ISS-78682
 */
function pageOf(path: string, search: string): string {
  const params = [...new URLSearchParams(search)].filter(([name]) => !name.startsWith(SVELTEKIT_PARAM));
  params.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const query = new URLSearchParams(params).toString();
  const pathname = path.replace(/\/+$/, '') || '/';
  return query === '' ? pathname : `${pathname}?${query}`;
}

/** The page (`pageOf`) a `__data.json` request loads, or null for any other request. */
export function dataRequestPage(input: RequestInfo | URL): string | null {
  const request = typeof Request !== 'undefined' && input instanceof Request ? input : null;
  const url = new URL(request?.url ?? String(input), location.href);
  return url.pathname.endsWith(DATA_SUFFIX) ? pageOf(url.pathname.slice(0, -DATA_SUFFIX.length), url.search) : null;
}

/**
 * The header value naming the browser's current view for `fetch(input)`, marked while a soft
 * navigation is entering it. A data request for a page other than the one the view shows or a
 * navigation is entering, its query included, is a preload (`data-sveltekit-preload-data`, a
 * pointer passing over a link) or the leaving page's own refresh: it is neither this view's refresh
 * nor its navigation's load, so it names none and its server half mints its own, read against the
 * load budget of the route it loads. A redirect is a navigation of its own, entering its own view.
 * ISS-80682
 */
function currentMark(input: RequestInfo | URL): string | null {
  const view = current;
  if (view === null) return null;
  const navigating = view.navigation === 'soft' && view.recorder.enteredAt === null;
  if (view.page !== null) {
    const loads = dataRequestPage(input);
    if (loads !== null && loads !== view.page) return null;
  }
  return viewMark(view.recorder.view, navigating);
}

/**
 * Route the document's own data requests and form actions through one that names its view.
 * SvelteKit issues both through `window.fetch` as it stands at the call, so the wrapper reaches
 * them; a request that already names a view keeps its own.
 */
function wrapFetch(): void {
  const native = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const mark = namesView(input, init) ? currentMark(input) : null;
      if (mark !== null) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has(VIEW_HEADER)) {
          headers.set(VIEW_HEADER, mark);
          return native(input, { ...init, headers });
        }
      }
    } catch {
      // Without the header the server half mints its own id, and the two halves do not join.
    }
    return native(input, init);
  };
}

/** Expire the origin's `sv` cookie, which a bundle older than the header wrote: this document names its view per request. */
function clearViewCookie(): void {
  try {
    document.cookie = `${VIEW_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // A cookie left behind is read only for a request with no header, which this document never sends.
  }
}

function beacon(half: ReturnType<typeof browserHalfOf>, endpoint: string): void {
  try {
    navigator.sendBeacon(endpoint, new Blob([JSON.stringify(half)], { type: 'application/json' }));
  } catch {
    // A failed send is dropped.
  }
}

function send(view: ViewState | null, endpoint: string): void {
  if (view === null || view.sent) return;
  view.sent = true;
  try {
    beacon(browserHalfOf(view, performance.now()), endpoint);
  } catch {
    // A failed send is dropped.
  }
}

/** Send the half of the view a navigation is leaving, as it stood when the navigation began. */
function sendLeaving(endpoint: string): void {
  const left = leaving;
  leaving = null;
  if (left === null || left.view.sent) return;
  left.view.sent = true;
  beacon(left.half, endpoint);
}

/** The promises the page data streams in, one level deep: the parts that fill in after. */
function streamed(data: unknown): Promise<unknown>[] {
  if (typeof data !== 'object' || data === null) return [];
  return Object.values(data).flatMap((value: unknown) =>
    typeof (value as { then?: unknown } | null)?.then === 'function' ? [Promise.resolve(value)] : []
  );
}

/** Mark the view finished once every part that fills in after has settled and the next frame painted it. */
function watchFinished(view: ViewState): void {
  const parts = streamed(page.data).map((part) => part.catch(() => undefined));
  void Promise.all([...parts, view.recorder.settled()]).then(() => {
    requestAnimationFrame(() => {
      if (view.finishedMs === null) view.finishedMs = view.recorder.elapsed();
    });
  });
}

function registerDocument(endpoint: string): void {
  const nav = navigationEntry();
  documentHidden = hiddenSpansAtRegistration(performance.now(), document.hidden, visibilityTimeline(), nav?.responseStart ?? 0);
  observe('largest-contentful-paint', (entries) => {
    const last = entries.at(-1);
    if (last !== undefined) lcpAt = last.startTime;
  });
  observe(
    'event',
    (entries) => {
      const view = current;
      if (view === null) return;
      for (const entry of entries as PerformanceEventTiming[]) {
        if (entry.interactionId > 0 && entry.startTime >= view.recorder.startedAt && view.interactions.length < MAX_INTERACTIONS) {
          view.interactions.push({ interactionId: entry.interactionId, duration: entry.duration });
        }
      }
    },
    { durationThreshold: EVENT_THRESHOLD_MS }
  );
  document.addEventListener('visibilitychange', () => {
    const now = performance.now();
    softNav.visibilityChanged(now, document.hidden);
    documentHidden?.visibilityChanged(now, document.hidden);
    if (document.hidden) {
      sendLeaving(endpoint);
      send(current, endpoint);
    }
  });
  window.addEventListener('pagehide', () => {
    sendLeaving(endpoint);
    send(current, endpoint);
  });
}

/**
 * Whether a navigation's `complete` rejected because a `beforeNavigate` handler cancelled it.
 * SvelteKit rejects it as well when a later navigation overtakes it, and that one goes on to enter
 * the view this one minted, so only a cancellation restores the view it would have left.
 */
export function cancelled(error: unknown): boolean {
  return error instanceof Error && error.message === 'navigation cancelled';
}

/** Start the browser half. Must run during component init: call it from the root layout. */
export function registerScreenReport(options: ScreenReportOptions): void {
  const endpoint = options.endpoint ?? TELEMETRY_ENDPOINT;
  if (browser) {
    const nav = navigationEntry();
    const id = isViewId(options.view) ? options.view : mintViewId();
    current = newView(id, page.route.id, new URL(location.href), 'hard', nav === undefined ? 0 : documentStart(nav));
    clearViewCookie();
    setViewLookup(() => current?.recorder);
    registerDocument(endpoint);
    wrapFetch();
  }

  beforeNavigate(({ shallow, type, willUnload, to, complete }) => {
    // A shallow `goto` writes history state and loads nothing; a navigation that unloads the
    // document ends this view through `pagehide`.
    if ((shallow && type === 'goto') || willUnload) return;
    const previous = current;
    const now = performance.now();
    if (previous !== null && leaving === null) leaving = { view: previous, half: browserHalfOf(previous, now) };
    const next = newView(mintViewId(), to?.route.id ?? null, to?.url ?? null, 'soft', now);
    current = next;
    softNav.start(now, document.hidden);
    complete.catch((error: unknown) => {
      if (cancelled(error) && current === next && next.recorder.enteredAt === null) {
        current = leaving?.view ?? previous;
        leaving = null;
      }
    });
  });

  afterNavigate(({ type, to }) => {
    const view = current;
    if (view === null) return;
    // The page the view entered, which a redirect in its load can have moved from where the navigation began.
    if (to?.url) view.page = pageOf(to.url.pathname, to.url.search);
    sendLeaving(endpoint);
    view.recorder.enteredAt = view.recorder.elapsed();
    if (type !== 'enter') view.showMs = softNavigationShowMs(softNav.elapsed(performance.now()));
    watchFinished(view);
  });
}
// dry-copy-end
