// dry-copy: sveltekit/screen-report/timing — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The arithmetic of a screen view's timing, over browser-free shapes so it is testable without a
 * document. `browser.ts` holds the observers that feed it.
 *
 * - Time to show: LCP for a hard load, timed from the document's own request, less the time the
 *   document spent hidden; for a soft navigation, which has no LCP, `beforeNavigate` to
 *   `afterNavigate` less the time the tab spent hidden. A soft navigation that loaded nothing has
 *   no time to show at all, never a zero.
 * - INP: the slowest interaction of the view, skipping one per fifty interactions, as the metric
 *   is defined. The fifty count every interaction of the view (the browser's `interactionCount`
 *   across it, where it keeps one), not only the slow ones an observer with a duration floor sees.
 * - The finished-loading mark: when every part that fills in after has rendered.
 *
 * THE HIDDEN-TIME ACCOUNTING came from the retired `pageTiming.ts` (`sveltekit/page-timing`) and
 * now lives only here. A backgrounded tab is throttled and its navigation suspended, so the wall
 * clock across it measures a wait no person sat through; a hard load's totals and a soft
 * navigation's both subtract it.
 */

/** A half-open [start, end) window on the `performance.now()` clock. */
export interface Span {
  start: number;
  end: number;
}

/** Elapsed time since `start`, excluding every stretch the document spent hidden. */
export class VisibleStopwatch {
  private startedAt = 0;
  private hiddenMs = 0;
  private hiddenSince: number | null = null;

  start(now: number, hidden: boolean): void {
    this.startedAt = now;
    this.hiddenMs = 0;
    this.hiddenSince = hidden ? now : null;
  }

  visibilityChanged(now: number, hidden: boolean): void {
    if (hidden) {
      this.hiddenSince ??= now;
    } else if (this.hiddenSince !== null) {
      this.hiddenMs += now - this.hiddenSince;
      this.hiddenSince = null;
    }
  }

  elapsed(now: number): number {
    const hidden = this.hiddenMs + (this.hiddenSince === null ? 0 : now - this.hiddenSince);
    return Math.max(0, now - this.startedAt - hidden);
  }
}

/** The stretches this document has spent hidden, for timing a hard load. */
export class HiddenSpans {
  private readonly closed: Span[];
  private hiddenSince: number | null;

  constructor(closed: Span[] = [], hiddenSince: number | null = null) {
    this.closed = [...closed];
    this.hiddenSince = hiddenSince;
  }

  visibilityChanged(now: number, hidden: boolean): void {
    if (hidden) {
      this.hiddenSince ??= now;
    } else if (this.hiddenSince !== null) {
      this.closed.push({ start: this.hiddenSince, end: now });
      this.hiddenSince = null;
    }
  }

  /** Hidden time inside `window`, read at `now`: a stretch still running counts up to it. */
  within(window: Span, now: number): number {
    const open = this.hiddenSince === null ? [] : [{ start: this.hiddenSince, end: now }];
    return busyMs([...this.closed, ...open], window);
  }
}

/** A `visibility-state` performance entry, as far as the arithmetic reads it. */
export interface VisibilityStateEntry {
  name: string;
  startTime: number;
}

/**
 * How long the document had already spent hidden when timing registered. Where the browser keeps
 * `visibility-state` entries (Chromium) they are the timeline; elsewhere a document still hidden
 * when its scripts run is taken as hidden from its first byte.
 */
export function hiddenSpansAtRegistration(
  now: number,
  hidden: boolean,
  timeline: VisibilityStateEntry[] | null,
  firstByteAt: number
): HiddenSpans {
  if (timeline !== null && timeline.length > 0) {
    const closed: Span[] = [];
    let hiddenSince: number | null = null;
    for (const entry of [...timeline].sort((a, b) => a.startTime - b.startTime)) {
      if (entry.name === 'hidden') {
        hiddenSince ??= entry.startTime;
      } else if (hiddenSince !== null) {
        closed.push({ start: hiddenSince, end: entry.startTime });
        hiddenSince = null;
      }
    }
    const spans = new HiddenSpans(closed, hiddenSince);
    spans.visibilityChanged(now, hidden);
    return spans;
  }
  return new HiddenSpans([], hidden ? Math.min(firstByteAt, now) : null);
}

/** Total time covered by `spans` inside `window`, counting overlapping spans once. */
export function busyMs(spans: Span[], window: Span): number {
  const clipped = spans
    .map((s) => ({ start: Math.max(s.start, window.start), end: Math.min(s.end, window.end) }))
    .filter((s) => s.end > s.start)
    .sort((a, b) => a.start - b.start);

  let total = 0;
  let openedAt = 0;
  let closesAt = -1;
  for (const span of clipped) {
    if (span.start > closesAt) {
      if (closesAt > openedAt) total += closesAt - openedAt;
      openedAt = span.start;
      closesAt = span.end;
    } else if (span.end > closesAt) {
      closesAt = span.end;
    }
  }
  if (closesAt > openedAt) total += closesAt - openedAt;
  return Math.round(total);
}

/** A navigation entry, as far as the arithmetic reads it. */
export interface DocumentEntry {
  startTime: number;
  fetchStart: number;
}

/**
 * Where this document's own load begins: `fetchStart`, which the browser records before it fetches
 * the resource a redirect chain ends at. Everything before it (the redirecting requests, the
 * previous document's unload) is the cost of whatever led here, not of this document. A redirect's
 * own `redirectStart` and `redirectEnd` cannot say so: the browser zeroes both when any hop is
 * cross-origin, the very chain whose hops cost most. ISS-80761
 */
export function documentStart(nav: DocumentEntry): number {
  return nav.fetchStart > nav.startTime ? nav.fetchStart : nav.startTime;
}

/** A navigation entry's phase marks, as far as `loadPhases` reads them. */
export interface PhaseEntry extends DocumentEntry {
  domainLookupStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
}

/**
 * Where a hard load's time went, so a slow one names its slow hop. Each is a visible duration in
 * milliseconds, null where the browser did not record both of its marks. Past the wait they cover
 * time to show, less the cache lookup and the gap before the request, which are next to nothing.
 *
 * - `wait_ms`: navigation start to `fetchStart`, the redirects and the previous document's unload
 *   that led here (`documentStart`), which time to show leaves out.
 * - `connect_ms`: DNS, TCP and TLS for the document (`domainLookupStart` to `connectEnd`); zero on
 *   a reused connection.
 * - `ttfb_ms`: the document request's wait for its first byte (`requestStart` to `responseStart`):
 *   the server's load and the round trip.
 * - `render_ms`: the first byte to the largest contentful paint, the document's download included,
 *   since a streamed page paints before its last byte; null with no LCP.
 */
export interface LoadPhases {
  wait_ms: number | null;
  connect_ms: number | null;
  ttfb_ms: number | null;
  render_ms: number | null;
}

/** A hard load's phases, each less the time the document spent hidden inside it. */
export function loadPhases(nav: PhaseEntry, lcpAt: number | null, hidden: HiddenSpans | null, now: number): LoadPhases {
  // A mark the browser did not record reads 0; the navigation start and `fetchStart` are always recorded.
  const recorded = (mark: number): number | null => (mark > 0 ? mark : null);
  const phase = (start: number | null, end: number | null): number | null =>
    start === null || end === null || end < start ? null : clamp(end - start - (hidden?.within({ start, end }, now) ?? 0));
  return {
    wait_ms: phase(nav.startTime, nav.fetchStart),
    connect_ms: phase(recorded(nav.domainLookupStart), recorded(nav.connectEnd)),
    ttfb_ms: phase(recorded(nav.requestStart), recorded(nav.responseStart)),
    render_ms: phase(recorded(nav.responseStart), lcpAt)
  };
}

/**
 * A hard load's time to show: its largest contentful paint, from the document's own start, less the
 * hidden time inside. Null where the browser reported no LCP (Safari before 26, a page painting
 * nothing contentful): an absent number, never a zero.
 */
export function hardLoadShowMs(lcpAt: number | null, start: number, hidden: HiddenSpans | null, now: number): number | null {
  if (lcpAt === null || lcpAt < start) return null;
  return clamp(lcpAt - start - (hidden?.within({ start, end: lcpAt }, now) ?? 0));
}

/**
 * A soft navigation's time to show: its visible time from `beforeNavigate` to `afterNavigate`. Null
 * where that rounds to nothing: a navigation that entered its view within the tick it began awaited
 * no request and no render (a form action's result applied to the page it was posted from), so it
 * loaded nothing to time, and a zero would count toward the screen's budget as a view shown at once.
 */
export function softNavigationShowMs(visibleMs: number): number | null {
  const ms = clamp(visibleMs);
  return ms > 0 ? ms : null;
}

/** An `event` timing entry, as far as INP reads it. */
export interface InteractionEntry {
  interactionId: number;
  duration: number;
}

/**
 * Interaction to Next Paint over one view: the longest interaction, where an interaction's latency
 * is its slowest event, skipping the single longest per fifty interactions. `interactionCount` is
 * how many interactions the view had in all, entries or not (an observer with a duration floor sees
 * only the slow ones); null where the browser keeps no count, and the entries are then the count.
 * Null with no entries.
 */
export function interactionToNextPaint(entries: InteractionEntry[], interactionCount: number | null = null): number | null {
  const longest = new Map<number, number>();
  for (const entry of entries) {
    if (entry.interactionId > 0) {
      longest.set(entry.interactionId, Math.max(longest.get(entry.interactionId) ?? 0, entry.duration));
    }
  }
  if (longest.size === 0) return null;
  const sorted = [...longest.values()].sort((a, b) => b - a);
  const total = Math.max(sorted.length, interactionCount ?? 0);
  const skip = Math.min(sorted.length - 1, Math.floor(total / 50));
  return clamp(sorted[skip] ?? 0);
}

export function clamp(ms: number): number {
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms) : 0;
}
// dry-copy-end
