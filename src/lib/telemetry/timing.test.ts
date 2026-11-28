// dry-copy: sveltekit/screen-report/timing-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import {
  HiddenSpans,
  VisibleStopwatch,
  documentStart,
  hardLoadShowMs,
  hiddenSpansAtRegistration,
  interactionToNextPaint,
  loadPhases,
  serverTimings,
  softNavigationShowMs
} from './timing';

describe('time to show', () => {
  it("is a hard load's LCP from the document's own start, less the time it spent hidden", () => {
    const hidden = new HiddenSpans([{ start: 100, end: 400 }]);
    expect(hardLoadShowMs(900, { startTime: 0, fetchStart: 0, responseStart: 80 }, hidden, 1000)).toBe(600);
  });

  it('starts after the redirects that led to the document', () => {
    expect(documentStart({ startTime: 0, fetchStart: 250 })).toBe(250);
    expect(documentStart({ startTime: 0, fetchStart: 0 })).toBe(0);
  });

  it('starts after a cross-origin redirect chain, whose redirect marks the browser zeroes', () => {
    const nav = { startTime: 0, fetchStart: 18_700, redirectStart: 0, redirectEnd: 0, responseStart: 18_900 };
    expect(documentStart(nav)).toBe(18_700);
    expect(hardLoadShowMs(19_200, nav, null, 20_000)).toBe(500);
  });

  it('is absent, never the redirect that led here, when the browser recorded no network marks', () => {
    const unmarked = { startTime: 0, fetchStart: 0, domainLookupStart: 0, connectEnd: 0, requestStart: 0, responseStart: 0 };
    expect(hardLoadShowMs(3061, unmarked, null, 4000)).toBeNull();
  });

  it('is absent, never zero, when the browser reported no LCP', () => {
    expect(hardLoadShowMs(null, { startTime: 0, fetchStart: 0, responseStart: 80 }, null, 1000)).toBeNull();
  });

  it("is a soft navigation's visible time from beforeNavigate to afterNavigate", () => {
    const watch = new VisibleStopwatch();
    watch.start(1000, false);
    watch.visibilityChanged(1100, true);
    watch.visibilityChanged(5100, false);
    expect(watch.elapsed(5200)).toBe(200);
  });

  it('is absent, never zero, for a soft navigation that entered its view within the tick it began', () => {
    expect(softNavigationShowMs(0)).toBeNull();
    expect(softNavigationShowMs(0.4)).toBeNull();
    expect(softNavigationShowMs(6.6)).toBe(7);
  });

  it('bills a document opened out of sight from its first byte as hidden', () => {
    expect(hiddenSpansAtRegistration(500, true, null, 80).within({ start: 0, end: 500 }, 500)).toBe(420);
  });
});

describe('loadPhases', () => {
  const nav = {
    startTime: 0,
    fetchStart: 18_700,
    domainLookupStart: 18_710,
    connectEnd: 18_950,
    requestStart: 18_960,
    responseStart: 19_072
  };

  it('names where a hard load reached through a redirect chain spent its time', () => {
    expect(loadPhases(nav, 19_452, null, 20_000)).toEqual({ wait_ms: 18_700, connect_ms: 240, ttfb_ms: 112, render_ms: 380 });
  });

  it('is zero for a navigation nothing led to, over a reused connection', () => {
    const direct = { startTime: 0, fetchStart: 0, domainLookupStart: 0, connectEnd: 0, requestStart: 4, responseStart: 90 };
    expect(loadPhases(direct, 300, null, 400)).toEqual({ wait_ms: 0, connect_ms: null, ttfb_ms: 86, render_ms: 210 });
  });

  it('has no render phase without an LCP, and leaves out the time the document spent hidden', () => {
    const hidden = new HiddenSpans([{ start: 1000, end: 11_000 }]);
    expect(loadPhases(nav, null, hidden, 20_000)).toEqual({ wait_ms: 8700, connect_ms: 240, ttfb_ms: 112, render_ms: null });
  });
});

describe('serverTimings', () => {
  const entry = (name: string, duration = 0, description = '') => ({ name, duration, description });

  it('keeps the allow-listed entries a document sent, each with its duration and description', () => {
    const entries = [entry('session', 16.4, 'platform'), entry('app', 41.6), entry('isolate', 0, 'cold'), entry('db', 9, 'pg')];
    expect(serverTimings(entries)).toEqual({
      session: { ms: 16, desc: 'platform' },
      app: { ms: 42, desc: null },
      isolate: { ms: null, desc: 'cold' }
    });
  });

  it('keeps the first of a repeated name, and no description that is not a short token', () => {
    const entries = [
      entry('session', 3, 'memory'),
      entry('session', 90, 'platform'),
      entry('app', 5, 'a b'),
      entry('isolate', 0, 'x'.repeat(33))
    ];
    expect(serverTimings(entries)).toEqual({
      session: { ms: 3, desc: 'memory' },
      app: { ms: 5, desc: null },
      isolate: { ms: null, desc: null }
    });
  });

  it('is null where the document sent none of them, or the browser keeps no list', () => {
    expect(serverTimings([entry('cfRequestDuration', 12)])).toBeNull();
    expect(serverTimings([])).toBeNull();
    expect(serverTimings(undefined)).toBeNull();
  });
});

describe('interactionToNextPaint', () => {
  it('is the slowest interaction, each read at its slowest event', () => {
    expect(
      interactionToNextPaint([
        { interactionId: 1, duration: 40 },
        { interactionId: 1, duration: 120 },
        { interactionId: 2, duration: 80 },
        { interactionId: 0, duration: 900 }
      ])
    ).toBe(120);
  });

  it('skips the single slowest per fifty interactions', () => {
    const entries = Array.from({ length: 50 }, (_, i) => ({ interactionId: i + 1, duration: i === 0 ? 2000 : 100 }));
    expect(interactionToNextPaint(entries)).toBe(100);
  });

  it('counts every interaction the browser counted toward the fifty, not only the slow ones observed', () => {
    const slow = [300, 200, 100].map((duration, i) => ({ interactionId: i + 1, duration }));
    expect(interactionToNextPaint(slow)).toBe(300);
    expect(interactionToNextPaint(slow, 120)).toBe(100);
    expect(interactionToNextPaint(slow, 1)).toBe(300);
  });

  it('is absent with no interaction', () => {
    expect(interactionToNextPaint([])).toBeNull();
  });
});
// dry-copy-end
