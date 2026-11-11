// dry-copy: sveltekit/screen-report/timing-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import {
  HiddenSpans,
  VisibleStopwatch,
  documentStart,
  hardLoadShowMs,
  hiddenSpansAtRegistration,
  interactionToNextPaint,
  softNavigationShowMs
} from './timing';

describe('time to show', () => {
  it("is a hard load's LCP from the document's own start, less the time it spent hidden", () => {
    const hidden = new HiddenSpans([{ start: 100, end: 400 }]);
    expect(hardLoadShowMs(900, 0, hidden, 1000)).toBe(600);
  });

  it('starts after the redirects that led to the document', () => {
    expect(documentStart({ startTime: 0, fetchStart: 250, redirectEnd: 240 })).toBe(250);
    expect(documentStart({ startTime: 0, fetchStart: 5, redirectEnd: 0 })).toBe(0);
  });

  it('is absent, never zero, when the browser reported no LCP', () => {
    expect(hardLoadShowMs(null, 0, null, 1000)).toBeNull();
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
