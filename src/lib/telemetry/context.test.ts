// dry-copy: sveltekit/screen-report/context-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import { ctx, later, poll, viewCtx } from './context';
import { ViewRecorder } from './recorder';

const VIEW = 'sv_0123456789abcdef0123456789abcdef';

function event(route = '/issues/[id]'): { route: { id: string }; locals: { screenView: ViewRecorder } } {
  return { route: { id: route }, locals: { screenView: new ViewRecorder(VIEW, route, { side: 'server' }) } };
}

describe('ctx', () => {
  it("names the event's view, its route and the part", () => {
    const e = event();
    const c = ctx(e, 'load');
    expect([c.view, c.route, c.part, c.recorder]).toEqual([VIEW, '/issues/[id]', 'load', e.locals.screenView]);
  });

  it('is one context per event and part, so every call site of one load shares its waits', () => {
    const e = event();
    expect(ctx(e)).toBe(ctx(e, 'load'));
    expect(ctx(e, 'form')).not.toBe(ctx(e));
  });

  it("qualifies an app endpoint's part with its route", () => {
    expect(ctx(event('/search'), 'endpoint').part).toBe('endpoint:/search');
  });

  it('reads the route untracked, so naming it makes no load depend on its route', () => {
    let tracking = true;
    const reads: boolean[] = [];
    const e = {
      ...event(),
      get route() {
        reads.push(tracking);
        return { id: '/issues/[id]' };
      },
      untrack<T>(fn: () => T): T {
        tracking = false;
        try {
          return fn();
        } finally {
          tracking = true;
        }
      }
    };
    expect(ctx(e).route).toBe('/issues/[id]');
    expect(reads).toEqual([false]);
  });

  it('records into nothing reported, rather than failing, outside any view', () => {
    const c = ctx({ route: { id: '/x' } });
    expect(c.view).toBe('detached');
    expect(viewCtx().view).toBe('detached');
  });
});

describe('later and poll', () => {
  it('open a part of their own, which the view waits for', async () => {
    const e = event();
    let release: () => void = () => {};
    const parts: string[] = [];
    void later(ctx(e), 'comments', async (c) => {
      parts.push(c.part);
      await new Promise<void>((resolve) => (release = resolve));
    });
    expect(e.locals.screenView.hasPending()).toBe(true);
    await poll(ctx(e), 'status', async (c) => parts.push(c.part));
    expect(parts).toEqual(['later:comments', 'poll:status']);
    expect(e.locals.screenView.pollCounts()).toEqual({ status: 1 });
    release();
    await e.locals.screenView.settled();
    expect(e.locals.screenView.hasPending()).toBe(false);
  });
});
// dry-copy-end
