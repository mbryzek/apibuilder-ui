// dry-copy: sveltekit/screen-report/recorder-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import { MAX_CALLS, VIEW_HEADER, ViewRecorder, type CallContext } from './recorder';

const VIEW = 'sv_0123456789abcdef0123456789abcdef';

function context(recorder: ViewRecorder, part = 'load'): CallContext {
  return { route: '/r', view: VIEW, part, recorder };
}

function answered(status = 200, length?: number): Response {
  return new Response('{}', { status, headers: length === undefined ? {} : { 'content-length': String(length) } });
}

describe('ViewRecorder.call', () => {
  it('records the operation, part, status, size and times from the view start', async () => {
    let now = 1000;
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server', clock: () => now });
    now = 1010;
    await recorder.call(context(recorder), 'getIssue', async (note) => {
      now = 1040;
      note.response(answered(200, 42));
      return 1;
    });
    expect(recorder.calls).toEqual([
      { operation: 'getIssue', part: 'load', start_ms: 10, end_ms: 40, status: 200, bytes: 42, waited: false, queries_counted: true }
    ]);
  });

  it("rethrows the call's own error as is and still records it", async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    const failure = new Error('api down');
    await expect(
      recorder.call(context(recorder), 'getIssue', async (note) => {
        note.response(answered(503));
        throw failure;
      })
    ).rejects.toBe(failure);
    expect(recorder.calls[0]?.status).toBe(503);
    expect(recorder.calls[0]?.end_ms).not.toBeNull();
  });

  it('runs the call at once, so the request goes out in the tick that issued it', () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    let ran = false;
    void recorder.call(context(recorder), 'op', () => {
      ran = true;
      return Promise.resolve(1);
    });
    expect(ran).toBe(true);
  });

  it('reads a wait from what the holding code awaited, not from when calls finished', async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    const c = context(recorder);
    const run = (): Promise<number> => recorder.call(c, 'op', () => Promise.resolve(1));
    const first = run();
    // Finished, but nobody resumed from it: the next call does not wait.
    await new Promise((resolve) => setTimeout(resolve, 0));
    void run();
    await first;
    void run();
    expect(recorder.calls.map((call) => call.waited)).toEqual([false, false, true]);
  });

  it('never has one context wait on another', async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    const layout = context(recorder);
    const page = context(recorder);
    await recorder.call(layout, 'getUser', () => Promise.resolve(1));
    void recorder.call(page, 'getIssue', () => Promise.resolve(1));
    expect(recorder.calls.map((call) => call.waited)).toEqual([false, false]);
  });

  it('carries at most MAX_CALLS and counts the rest', async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    const c = context(recorder);
    await Promise.all(Array.from({ length: MAX_CALLS + 3 }, () => recorder.call(c, 'op', () => Promise.resolve(1))));
    expect(recorder.calls).toHaveLength(MAX_CALLS);
    expect(recorder.dropped).toBe(3);
  });
});

describe('the view id header', () => {
  it('goes on every server call', async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    await recorder.call(context(recorder), 'op', async (note) => {
      expect(note.headers('https://api.elsewhere.test/x')).toEqual({ [VIEW_HEADER]: VIEW });
      return 1;
    });
  });

  it('goes on a browser call to the page origin and not on one elsewhere, which counts no queries', async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'browser', origin: 'https://admin.test' });
    await recorder.call(context(recorder), 'same', async (note) => {
      expect(note.headers('/api/x')).toEqual({ [VIEW_HEADER]: VIEW });
      return 1;
    });
    await recorder.call(context(recorder), 'cross', async (note) => {
      expect(note.headers('https://api.test/x')).toEqual({});
      return 1;
    });
    expect(recorder.calls.map((call) => call.queries_counted)).toEqual([true, false]);
  });
});

describe('parts that fill in after and polls', () => {
  it('settles only once every later part has, including one opened while waiting', async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    let release: () => void = () => {};
    recorder.pend(
      new Promise<void>((resolve) => {
        release = () => {
          recorder.pend(Promise.resolve());
          resolve();
        };
      })
    );
    let settled = false;
    const waiting = recorder.settled().then(() => (settled = true));
    await Promise.resolve();
    expect(settled).toBe(false);
    release();
    await waiting;
    expect(recorder.hasPending()).toBe(false);
  });

  it('settles over a later part that rejected', async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'server' });
    recorder.pend(Promise.reject(new Error('later failed')));
    await expect(recorder.settled()).resolves.toBeUndefined();
  });

  it('counts poll ticks by name', () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'browser' });
    recorder.pollTick('status');
    recorder.pollTick('status');
    expect(recorder.pollCounts()).toEqual({ status: 2 });
  });

  it("counts each poll's busiest tick, past the call cap too", async () => {
    const recorder = new ViewRecorder(VIEW, '/r', { side: 'browser' });
    const poll = context(recorder, 'poll:status');
    for (let i = 0; i < MAX_CALLS; i += 1) await recorder.call(context(recorder, 'browser'), 'op', async () => 1);
    for (let tick = 0; tick < 1000; tick += 1) {
      recorder.pollTick('status');
      await recorder.call(poll, 'getStatus', async () => 1);
      if (tick === 7) await recorder.call(poll, 'getStatus', async () => 1);
    }
    expect(recorder.calls).toHaveLength(MAX_CALLS);
    expect(recorder.pollPeakCounts()).toEqual({ status: 2 });
  });
});
// dry-copy-end
