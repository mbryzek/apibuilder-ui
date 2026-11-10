// dry-copy: sveltekit/screen-report/browser — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The browser half of the screen report. The root layout registers it once, during component init,
 * with the view id its server load handed over (`screenViewId` in `server.ts`):
 *
 *     registerScreenReport({ view: data.screenView });
 *
 * It holds the browser's current view: the hard load's, adopted from the page data on hydration,
 * then each soft navigation's, minted in `beforeNavigate` and written to the `sv` cookie so the
 * server half of that navigation's data request carries the same id. A universal load or a
 * component call in the browser finds its view here (`ctx`, `viewCtx`).
 *
 * The half carries every call the browser made in the view and its timing, and is sent ONCE by
 * `sendBeacon` to `/_telemetry` when the view ends: in `beforeNavigate` for a view a soft
 * navigation leaves, and at the first `visibilitychange` to hidden or `pagehide` for the document's
 * last view. Interaction after that send (INP) is lost, which the report accepts. Telemetry never
 * breaks a page: every browser API here is guarded, and a failed send is dropped.
 */
import { browser } from '$app/env';
import { afterNavigate, beforeNavigate } from '$app/navigation';
import { page } from '$app/state';
import { setViewLookup } from './context';
import { ViewRecorder } from './recorder';
import { halfOf, type ReportTiming } from './report';
import {
  VisibleStopwatch,
  clamp,
  documentStart,
  hardLoadShowMs,
  hiddenSpansAtRegistration,
  interactionToNextPaint,
  type HiddenSpans,
  type InteractionEntry,
  type VisibilityStateEntry
} from './timing';
import { isViewId, mintViewId, viewCookie } from './view';

/** Where the browser half is posted. */
export const TELEMETRY_ENDPOINT = '/_telemetry';

/** The slowest an interaction can be and still go unrecorded: the `event` entries' own floor. */
const EVENT_THRESHOLD_MS = 40;
/** Interactions kept per view; past it INP reads the ones kept. */
const MAX_INTERACTIONS = 500;

/** One screen view as the browser holds it. */
interface ViewState {
  recorder: ViewRecorder;
  navigation: 'hard' | 'soft';
  /** The view's own clock reading at `afterNavigate`; a hard load's browser `load` calls before it are hydration replays. */
  enteredAt: number | null;
  showMs: number | null;
  finishedMs: number | null;
  interactions: InteractionEntry[];
  sent: boolean;
}

export interface ScreenReportOptions {
  /** The view id the root layout's server load handed over; a page with none mints its own. */
  view: string | null | undefined;
  endpoint?: string;
}

let current: ViewState | null = null;
const softNav = new VisibleStopwatch();
let documentHidden: HiddenSpans | null = null;
let lcpAt: number | null = null;

function newView(id: string, route: string | null, navigation: 'hard' | 'soft', startedAt: number): ViewState {
  return {
    recorder: new ViewRecorder(id, route, { side: 'browser', startedAt, origin: location.origin }),
    navigation,
    enteredAt: null,
    showMs: null,
    finishedMs: null,
    interactions: [],
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
    inp_ms: interactionToNextPaint(view.interactions),
    finished_ms: view.finishedMs
  };
}

/** The half to send: a hard load's `load` calls before hydration finished are replays the server half already holds. */
export function browserHalfOf(view: ViewState, now: number): ReturnType<typeof halfOf> {
  const half = halfOf(view.recorder, { timing: timingOf(view, now) });
  if (view.navigation !== 'hard' || view.enteredAt === null) return half;
  const entered = view.enteredAt;
  return { ...half, calls: half.calls.filter((call) => !(call.part === 'load' && call.start_ms <= entered)) };
}

function send(view: ViewState | null, endpoint: string): void {
  if (view === null || view.sent) return;
  view.sent = true;
  try {
    const half = browserHalfOf(view, performance.now());
    navigator.sendBeacon(endpoint, new Blob([JSON.stringify(half)], { type: 'application/json' }));
  } catch {
    // A failed send is dropped.
  }
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
    if (document.hidden) send(current, endpoint);
  });
  window.addEventListener('pagehide', () => send(current, endpoint));
}

/** Start the browser half. Must run during component init: call it from the root layout. */
export function registerScreenReport(options: ScreenReportOptions): void {
  const endpoint = options.endpoint ?? TELEMETRY_ENDPOINT;
  if (browser) {
    const nav = navigationEntry();
    const id = isViewId(options.view) ? options.view : mintViewId();
    current = newView(id, page.route.id, 'hard', nav === undefined ? 0 : documentStart(nav));
    setViewLookup(() => current?.recorder);
    registerDocument(endpoint);
  }

  beforeNavigate(({ shallow, type, willUnload, to }) => {
    // A shallow `goto` writes history state and loads nothing; a navigation that unloads the
    // document ends this view through `pagehide`.
    if ((shallow && type === 'goto') || willUnload) return;
    send(current, endpoint);
    const id = mintViewId();
    const now = performance.now();
    current = newView(id, to?.route.id ?? null, 'soft', now);
    softNav.start(now, document.hidden);
    try {
      document.cookie = viewCookie(id, location.protocol === 'https:');
    } catch {
      // Without the cookie the server half mints its own id, and the two halves do not join.
    }
  });

  afterNavigate(({ type }) => {
    const view = current;
    if (view === null) return;
    view.enteredAt = view.recorder.elapsed();
    if (type !== 'enter') view.showMs = clamp(softNav.elapsed(performance.now()));
    watchFinished(view);
  });
}
// dry-copy-end
