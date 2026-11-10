// @vitest-environment jsdom
// dry-copy: sveltekit/screen-report/browser-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The browser half: which view the browser holds, when its half is sent, and what it carries.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as BrowserModule from './browser';
import type * as ContextModule from './context';

interface Navigation {
  type: string;
  shallow?: boolean;
  willUnload?: boolean;
  to?: { route: { id: string | null } } | null;
}

let before: ((navigation: Required<Navigation>) => void) | null = null;
let after: ((navigation: { type: string }) => void) | null = null;
let clock = 0;
const page = { route: { id: '/issues/[id]' as string | null }, data: {} as Record<string, unknown> };

vi.mock('$app/env', () => ({ browser: true }));
vi.mock('$app/state', () => ({ page }));
vi.mock('$app/navigation', () => ({
  beforeNavigate: (fn: (navigation: Required<Navigation>) => void) => {
    before = fn;
  },
  afterNavigate: (fn: (navigation: { type: string }) => void) => {
    after = fn;
  }
}));

class FakeObserver {
  static supportedEntryTypes = ['largest-contentful-paint', 'event'];
  static byType = new Map<string, FakeObserver>();
  constructor(private readonly callback: (list: { getEntries: () => unknown[] }) => void) {}
  observe(options: { type: string }): void {
    FakeObserver.byType.set(options.type, this);
  }
  deliver(entries: unknown[]): void {
    this.callback({ getEntries: () => entries });
  }
}

const VIEW = 'sv_0123456789abcdef0123456789abcdef';
let beacons: Blob[] = [];
let hidden = false;

function navigate(navigation: Navigation): void {
  before?.({ shallow: false, willUnload: false, to: { route: { id: '/other' } }, ...navigation } as Required<Navigation>);
}

function hide(): void {
  hidden = true;
  document.dispatchEvent(new Event('visibilitychange'));
}

async function sent(): Promise<Record<string, unknown>[]> {
  return Promise.all(beacons.map(async (blob) => JSON.parse(await blob.text()) as Record<string, unknown>));
}

async function load(): Promise<{ browser: typeof BrowserModule; context: typeof ContextModule }> {
  vi.resetModules();
  return { browser: await import('./browser'), context: await import('./context') };
}

function call(context: ContextModule.CallContext, operation: string): Promise<number> {
  return context.recorder.call(context, operation, async (note) => {
    note.headers('/api/x');
    note.response(new Response('{}'));
    return 1;
  });
}

beforeEach(() => {
  clock = 0;
  hidden = false;
  beacons = [];
  before = null;
  after = null;
  FakeObserver.byType.clear();
  vi.stubGlobal('PerformanceObserver', FakeObserver);
  vi.stubGlobal('requestAnimationFrame', (fn: () => void) => setTimeout(fn, 0));
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) =>
    type === 'navigation' ? ([{ startTime: 0, fetchStart: 0, redirectEnd: 0, responseStart: 50 }] as unknown as PerformanceEntryList) : []
  );
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    value: (_url: string, blob: Blob) => {
      beacons.push(blob);
      return true;
    }
  });
  document.cookie = 'sv=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
});

afterEach(() => {
  // Every module instance a test loaded keeps its listeners on the one document; ending each one's
  // view here keeps it out of the next test's beacons.
  window.dispatchEvent(new Event('pagehide'));
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('a hard load', () => {
  it("adopts the server's view id and sends its half once, at the first hidden moment", async () => {
    const { browser, context } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    FakeObserver.byType.get('largest-contentful-paint')?.deliver([{ startTime: 420 }]);
    clock = 1000;
    await call(context.viewCtx('browser'), 'markRead');
    hide();
    hide();
    window.dispatchEvent(new Event('pagehide'));
    const halves = await sent();
    expect(halves).toHaveLength(1);
    expect(halves[0]).toMatchObject({
      half: 'browser',
      view: VIEW,
      route: '/issues/[id]',
      timing: { navigation: 'hard', show_ms: 420, inp_ms: null }
    });
    expect(halves[0]?.['calls']).toMatchObject([{ operation: 'markRead', part: 'browser', queries_counted: true }]);
  });

  it("leaves out the load's hydration replays, which the server half already holds", async () => {
    const { browser, context } = await load();
    browser.registerScreenReport({ view: VIEW });
    await call(context.ctx({ route: { id: '/issues/[id]' } }), 'getIssue');
    clock = 10;
    after?.({ type: 'enter' });
    hide();
    expect((await sent())[0]?.['calls']).toEqual([]);
  });

  it('reads INP from the interactions of the view', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    FakeObserver.byType.get('event')?.deliver([
      { interactionId: 1, duration: 48, startTime: 100 },
      { interactionId: 1, duration: 96, startTime: 100 },
      { interactionId: 2, duration: 64, startTime: 200 }
    ]);
    hide();
    expect((await sent())[0]?.['timing']).toMatchObject({ inp_ms: 96 });
  });
});

describe('a soft navigation', () => {
  it('ends the view it leaves, mints its own id into the sv cookie, and times itself to afterNavigate', async () => {
    const { browser, context } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    clock = 1000;
    navigate({ type: 'link' });
    const first = await sent();
    expect(first).toHaveLength(1);
    expect(first[0]?.['view']).toBe(VIEW);
    const cookie = /sv=(sv_[0-9a-f]{32})/.exec(document.cookie)?.[1];
    expect(cookie).toBeDefined();
    // The navigation's universal load runs in the browser, in the new view.
    await call(context.ctx({ route: { id: '/other' } }), 'getOther');
    clock = 1300;
    after?.({ type: 'link' });
    navigate({ type: 'link' });
    const halves = await sent();
    expect(halves[1]).toMatchObject({ view: cookie, route: '/other', timing: { navigation: 'soft', show_ms: 300 } });
    expect(halves[1]?.['calls']).toMatchObject([{ operation: 'getOther', part: 'load' }]);
  });

  it('is not started by a shallow goto or a navigation that unloads the document', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    navigate({ type: 'goto', shallow: true });
    navigate({ type: 'leave', willUnload: true });
    expect(beacons).toHaveLength(0);
  });

  it('marks the view finished once its streamed parts settle and paint', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    let release: () => void = () => {};
    page.data = { comments: new Promise<void>((resolve) => (release = resolve)) };
    clock = 200;
    after?.({ type: 'enter' });
    clock = 700;
    release();
    await new Promise((resolve) => setTimeout(resolve, 5));
    hide();
    page.data = {};
    expect((await sent())[0]?.['timing']).toMatchObject({ finished_ms: 700 });
  });
});
// dry-copy-end
