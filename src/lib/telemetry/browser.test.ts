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
  to?: { route: { id: string | null }; url: URL } | null;
  complete?: Promise<void>;
}

let before: ((navigation: Required<Navigation>) => void) | null = null;
let after: ((navigation: { type: string; to?: { url: URL } }) => void) | null = null;
let clock = 0;
const page = { route: { id: '/issues/[id]' as string | null }, data: {} as Record<string, unknown> };

vi.mock('$app/env', () => ({ browser: true }));
vi.mock('$app/env/public', () => ({ PUBLIC_VERSION: '0.3.97' }));
vi.mock('$app/state', () => ({ page }));
vi.mock('$app/navigation', () => ({
  beforeNavigate: (fn: (navigation: Required<Navigation>) => void) => {
    before = fn;
  },
  afterNavigate: (fn: (navigation: { type: string; to?: { url: URL } }) => void) => {
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
let requests: { url: string; headers: Headers }[] = [];

/** Start a navigation; the answer settles its `complete` the way SvelteKit does. */
function navigate(navigation: Navigation): { reject: (message: string) => Promise<void> } {
  let reject: (error: Error) => void = () => {};
  const complete = new Promise<void>((_resolve, fail) => (reject = fail));
  complete.catch(() => undefined);
  before?.({
    shallow: false,
    willUnload: false,
    to: { route: { id: '/other' }, url: new URL('/other', location.href) },
    complete,
    ...navigation
  } as Required<Navigation>);
  return {
    reject: async (message) => {
      reject(new Error(message));
      await Promise.resolve();
    }
  };
}

/** The view header the document's next request to `url` carries. */
async function headerOf(url: string, init?: RequestInit): Promise<string | null> {
  await window.fetch(url, init);
  return requests.at(-1)?.headers.get('x-screen-view-id') ?? null;
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
    type === 'navigation'
      ? ([
          { startTime: 0, fetchStart: 0, domainLookupStart: 0, connectEnd: 0, requestStart: 10, responseStart: 50 }
        ] as unknown as PerformanceEntryList)
      : []
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
  history.replaceState(null, '', '/issues/1');
  requests = [];
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ url: String(input), headers: new Headers(init?.headers) });
    return Promise.resolve(new Response('{}'));
  });
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
      timing: { navigation: 'hard', show_ms: 420, inp_ms: null, phases: { wait_ms: 0, connect_ms: null, ttfb_ms: 40, render_ms: 370 } },
      release: '0.3.97'
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

  it("books each load re-run after entry as one tick of the refresh poll, never as the view's load", async () => {
    const { browser, context } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    clock = 1000;
    // Two invalidates: each re-runs the universal load with a fresh event.
    const first = context.ctx({ route: { id: '/issues/[id]' } });
    await call(first, 'getIssue');
    await call(first, 'listComments');
    clock = 2000;
    await call(context.ctx({ route: { id: '/issues/[id]' } }), 'getIssue');
    hide();
    const half = (await sent())[0];
    expect(half?.['calls']).toMatchObject([
      { operation: 'getIssue', part: 'poll:refresh', start_ms: 1000 },
      { operation: 'listComments', part: 'poll:refresh', waited: true },
      { operation: 'getIssue', part: 'poll:refresh', start_ms: 2000 }
    ]);
    expect(half).toMatchObject({ polls: { refresh: 2 }, poll_peaks: { refresh: 2 } });
  });

  it('names its view, unmarked, on its own data requests and form actions, so a refresh is booked to it', async () => {
    document.cookie = 'sv=sv_fedcba9876543210fedcba9876543210.nav; path=/';
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    // The origin's cookie, which a bundle older than the header wrote, is expired.
    expect(document.cookie).toBe('');
    expect(await headerOf('/issues/1/__data.json?x-sveltekit-invalidated=01')).toBe(VIEW);
    expect(await headerOf('/issues/1?/comment', { method: 'POST', headers: { 'x-sveltekit-action': 'true' } })).toBe(VIEW);
  });

  it("names no view on a preload of another page's data, so its first load is not booked as a refresh", async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    expect(await headerOf('/__data.json?x-sveltekit-invalidated=01')).toBeNull();
    expect(await headerOf('/issues/2/__data.json')).toBeNull();
    expect(await headerOf('/issues/1/__data.json?x-sveltekit-trailing-slash=1')).toBe(VIEW);
    navigate({ type: 'link' });
    after?.({ type: 'link' });
    expect(await headerOf('/issues/1/__data.json')).toBeNull();
    expect(await headerOf('/other/__data.json')).not.toBeNull();
  });

  it("names no view on a preload of the same route's page under another query, a filter or pager link", async () => {
    history.replaceState(null, '', '/issues?stage=open&page=2');
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    expect(await headerOf('/issues/__data.json?stage=closed')).toBeNull();
    expect(await headerOf('/issues/__data.json?stage=open&page=3')).toBeNull();
    expect(await headerOf('/issues/__data.json')).toBeNull();
    expect(await headerOf('/issues/__data.json?page=2&stage=open&x-sveltekit-invalidated=01')).toBe(VIEW);
    navigate({ type: 'link', to: { route: { id: '/issues' }, url: new URL('/issues?stage=closed', location.href) } });
    after?.({ type: 'link', to: { url: new URL('/issues?stage=closed', location.href) } });
    expect(await headerOf('/issues/__data.json?stage=closed&x-sveltekit-invalidated=01')).not.toBeNull();
    expect(await headerOf('/issues/__data.json?stage=open&page=2')).toBeNull();
  });

  it('leaves alone a request that is not a data request or form action of its own origin', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    expect(await headerOf('/api/issues')).toBeNull();
    expect(await headerOf('https://elsewhere.test/x/__data.json')).toBeNull();
    expect(await headerOf('/issues', { method: 'POST' })).toBeNull();
    const other = 'sv_fedcba9876543210fedcba9876543210';
    expect(await headerOf('/issues/__data.json', { headers: { 'x-screen-view-id': other } })).toBe(other);
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
  it('ends the view it leaves once it goes ahead, names its own id on its data request, and times itself to afterNavigate', async () => {
    const { browser, context } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    clock = 1000;
    navigate({ type: 'link' });
    const id = /^(sv_[0-9a-f]{32})\.nav$/.exec((await headerOf('/other/__data.json')) ?? '')?.[1];
    expect(id).toBeDefined();
    // The navigation's universal load runs in the browser, in the new view.
    await call(context.ctx({ route: { id: '/other' } }), 'getOther');
    clock = 1300;
    after?.({ type: 'link' });
    const first = await sent();
    expect(first).toHaveLength(1);
    expect(first[0]).toMatchObject({ view: VIEW, calls: [] });
    expect(await headerOf('/other/__data.json')).toBe(id);
    navigate({ type: 'link' });
    after?.({ type: 'link' });
    const halves = await sent();
    expect(halves[1]).toMatchObject({ view: id, route: '/other', timing: { navigation: 'soft', show_ms: 300 } });
    expect(halves[1]?.['calls']).toMatchObject([{ operation: 'getOther', part: 'load' }]);
  });

  it("names no view on another page's data request while it is entering, so a preload is not booked as its load", async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    navigate({ type: 'link' });
    const id = /^(sv_[0-9a-f]{32})\.nav$/.exec((await headerOf('/other/__data.json')) ?? '')?.[1];
    expect(id).toBeDefined();
    // A pointer passing over a link to another page, or the leaving page's poll, before the navigation enters.
    expect(await headerOf('/issues/2/__data.json')).toBeNull();
    expect(await headerOf('/issues/1/__data.json?x-sveltekit-invalidated=01')).toBeNull();
    expect(await headerOf('/other/__data.json?x-sveltekit-trailing-slash=1')).toBe(`${id}.nav`);
    expect(await headerOf('/other?/save', { method: 'POST', headers: { 'x-sveltekit-action': 'true' } })).toBe(`${id}.nav`);
  });

  it('reports no time to show for a navigation that entered its view within the tick it began', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    clock = 1000;
    navigate({ type: 'form' });
    after?.({ type: 'form' });
    hide();
    const halves = await sent();
    expect(halves[1]).toMatchObject({ timing: { navigation: 'soft' } });
    expect((halves[1]?.['timing'] as Record<string, unknown>)['show_ms']).toBeNull();
  });

  it("keeps the navigation's own load as load, and books a re-run after entry as a refresh tick", async () => {
    const { browser, context } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    navigate({ type: 'link' });
    const navigationLoad = context.ctx({ route: { id: '/other' } });
    await call(navigationLoad, 'getOther');
    clock = 300;
    after?.({ type: 'link' });
    // A load context first seen before entry stays the navigation's, even for a call it makes later.
    await call(navigationLoad, 'getMore');
    clock = 900;
    await call(context.ctx({ route: { id: '/other' } }), 'getOther');
    navigate({ type: 'link' });
    after?.({ type: 'link' });
    const half = (await sent())[1];
    expect(half?.['calls']).toMatchObject([
      { operation: 'getOther', part: 'load' },
      { operation: 'getMore', part: 'load' },
      { operation: 'getOther', part: 'poll:refresh', start_ms: 900 }
    ]);
    expect(half?.['polls']).toEqual({ refresh: 1 });
  });

  it('names its own view whatever another window of the app wrote into the cookie', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    document.cookie = 'sv=sv_fedcba9876543210fedcba9876543210.nav; path=/';
    expect(await headerOf('/issues/1/__data.json')).toBe(VIEW);
  });

  it('keeps the view it would have left when another handler cancels it', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    await navigate({ type: 'link' }).reject('navigation cancelled');
    expect(beacons).toHaveLength(0);
    expect(await headerOf('/issues/1/__data.json')).toBe(VIEW);
    hide();
    const halves = await sent();
    expect(halves).toHaveLength(1);
    expect(halves[0]).toMatchObject({ view: VIEW, timing: { navigation: 'hard' } });
  });

  it('enters its view through the navigation that overtakes it', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    const overtaken = navigate({ type: 'link' });
    const id = (await headerOf('/other/__data.json'))?.replace('.nav', '');
    await overtaken.reject('navigation aborted');
    after?.({ type: 'link' });
    expect(await headerOf('/other/__data.json')).toBe(id);
    expect((await sent()).map((half) => half['view'])).toEqual([VIEW]);
  });

  it('sends the view a navigation is leaving when the document goes away mid-navigation', async () => {
    const { browser } = await load();
    browser.registerScreenReport({ view: VIEW });
    after?.({ type: 'enter' });
    navigate({ type: 'link' });
    hide();
    const halves = await sent();
    expect(halves.map((half) => half['view'])[0]).toBe(VIEW);
    expect(halves).toHaveLength(2);
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
