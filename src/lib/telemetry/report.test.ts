// dry-copy: sveltekit/screen-report/report-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it, vi } from 'vitest';
import { globalBudget } from './budget';
import { decodeLogs } from './otlp.test.decode';
import { MAX_CALLS, type RecordedCall } from './recorder';
import { peaksOfCalls, postReport, reportAttributes, sanitizeBrowserHalf, type ReportHalf } from './report';

const VIEW = 'sv_0123456789abcdef0123456789abcdef';

function call(part: string, overrides: Partial<RecordedCall> = {}): RecordedCall {
  return { operation: 'op', part, start_ms: 1, end_ms: 2, status: 200, bytes: 10, waited: false, queries_counted: true, ...overrides };
}

const browserHalf = {
  half: 'browser',
  view: VIEW,
  route: '/issues/[id]',
  calls: [call('poll:status'), call('poll:status')],
  dropped_calls: 0,
  polls: { status: 2 },
  poll_peaks: { status: 1 },
  timing: { navigation: 'soft', show_ms: 120, inp_ms: null, finished_ms: 300 }
};

describe('sanitizeBrowserHalf', () => {
  it('keeps a well-formed half', () => {
    expect(sanitizeBrowserHalf(browserHalf)).toEqual(browserHalf);
  });

  it('refuses a half that is not a browser half of a minted view', () => {
    expect(sanitizeBrowserHalf({ ...browserHalf, half: 'server' })).toBeNull();
    expect(sanitizeBrowserHalf({ ...browserHalf, view: 'mine' })).toBeNull();
    expect(sanitizeBrowserHalf({ ...browserHalf, timing: { navigation: 'teleport' } })).toBeNull();
    expect(sanitizeBrowserHalf('[]')).toBeNull();
  });

  it('copies field by field, so nothing a client adds survives', () => {
    const half = sanitizeBrowserHalf({ ...browserHalf, app: 'forged', budget: { showMs: 99999 }, calls: [{ ...call('load'), extra: 1 }] });
    expect(half).not.toHaveProperty('app');
    expect(half).not.toHaveProperty('budget');
    expect(half?.calls[0]).not.toHaveProperty('extra');
  });

  it('drops a call that names no operation and turns nonsense numbers into nulls', () => {
    const half = sanitizeBrowserHalf({
      ...browserHalf,
      calls: [{ part: 'load', start_ms: 1 }, call('load', { status: 42, end_ms: -5 })]
    });
    expect(half?.calls).toEqual([call('load', { status: null, end_ms: null })]);
  });

  it('keeps at most MAX_CALLS and counts the rest as dropped', () => {
    const half = sanitizeBrowserHalf({ ...browserHalf, calls: Array.from({ length: MAX_CALLS + 7 }, () => call('load')) });
    expect(half?.calls).toHaveLength(MAX_CALLS);
    expect(half?.dropped_calls).toBe(7);
  });
});

describe('the record monitoring reads', () => {
  const server: ReportHalf = {
    half: 'server',
    view: VIEW,
    route: '/issues/[id]',
    calls: [call('load'), call('load', { waited: true }), call('later:comments'), call('later:comments'), call('later:users')],
    dropped_calls: 1,
    polls: {},
    request: 'document'
  };

  it('carries the keys its rules read, each half only what it made', () => {
    const attributes = Object.fromEntries(
      reportAttributes({ ...server, app: 'idempotent', repo: 'mbryzek/idempotent', budget: globalBudget }, peaksOfCalls(server)).map(
        (a) => [a.key, a.value]
      )
    );
    expect(attributes).toEqual({
      'screen.report': 'server',
      'screen.repo': 'mbryzek/idempotent',
      'screen.app': 'idempotent',
      'screen.route': '/issues/[id]',
      'screen.view': VIEW,
      'screen.navigation': 'hard',
      'screen.load.calls': 2,
      'screen.load.waits': 1,
      'screen.later.max_calls': 2,
      'screen.poll.max_calls': 0,
      'screen.poll.count': 0,
      'screen.calls': 6,
      'screen.budget.show_ms': 500,
      'screen.budget.load.calls': 3,
      'screen.budget.load.waits': 2,
      'screen.budget.parts': 1,
      'screen.budget.poll': 1
    });
  });

  it('carries the client round trip only where one was measured', () => {
    const stamped = { ...server, app: 'idempotent', repo: 'mbryzek/idempotent', budget: globalBudget };
    const keys = (half: typeof stamped) => reportAttributes(half, peaksOfCalls(half)).map((a) => a.key);
    expect(keys(stamped)).not.toContain('screen.client_rtt_ms');
    const far = reportAttributes({ ...stamped, client_rtt_ms: 753 }, peaksOfCalls(stamped));
    expect(far.find((a) => a.key === 'screen.client_rtt_ms')?.value).toBe(753);
  });

  it('reads a poll per tick', () => {
    const half = sanitizeBrowserHalf(browserHalf);
    expect(half === null ? null : peaksOfCalls(half)).toEqual({ later: 0, poll: 1 });
  });
});

describe('peaksOfCalls', () => {
  const half = sanitizeBrowserHalf(browserHalf);
  if (half === null) throw new Error('fixture refused');

  it("reads a poll's peak from the per-tick count its recorder carried, which the call cap cannot shrink", () => {
    // 1000 ticks of two calls each: the cap kept 500 calls, which divided by the ticks reads 1.
    const capped: ReportHalf = {
      ...half,
      calls: Array.from({ length: MAX_CALLS }, () => call('poll:status')),
      dropped_calls: 1500,
      polls: { status: 1000 },
      poll_peaks: { status: 2 }
    };
    expect(peaksOfCalls(capped).poll).toBe(2);
  });

  it('divides the carried calls by the ticks for a half that names no peak', () => {
    const old = sanitizeBrowserHalf({ ...browserHalf, poll_peaks: undefined, calls: [1, 2, 3].map(() => call('poll:status')) });
    expect(old?.poll_peaks).toEqual({});
    expect(old === null ? null : peaksOfCalls(old).poll).toBe(2);
  });
});

describe('postReport', () => {
  const half = sanitizeBrowserHalf(browserHalf)!;

  it('posts one protobuf record with the writer token', async () => {
    const fetch = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 204 }));
    const sent = await postReport(half, globalBudget, {
      app: 'idempotent',
      repo: 'mbryzek/idempotent',
      token: () => 'tok',
      fetch: fetch as unknown as typeof globalThis.fetch
    });
    expect(sent).toBe(true);
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe('https://obs-report.idempotent.io/insert/opentelemetry/v1/logs');
    expect(init?.headers).toEqual({ 'content-type': 'application/x-protobuf', authorization: 'Bearer tok' });
    const record = decodeLogs(init?.body as Uint8Array);
    expect(record.resource).toEqual({ 'service.name': 'idempotent' });
    expect(record.attributes['screen.show_ms']).toBe(120);
    expect(JSON.parse(record.body)).toEqual(half.calls);
  });

  it('posts nothing without a token, and drops a refused or failed send', async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 400 }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const door = { app: 'a', repo: 'mbryzek/a', fetch: fetch as unknown as typeof globalThis.fetch };
    expect(await postReport(half, globalBudget, { ...door, token: () => undefined })).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(await postReport(half, globalBudget, { ...door, token: () => 'tok' })).toBe(false);
    expect(warn).toHaveBeenCalledWith('screen report: the report door answered 400');
    const throwing = vi.fn(async () => {
      throw new Error('offline');
    });
    expect(
      await postReport(half, globalBudget, { ...door, token: () => 'tok', fetch: throwing as unknown as typeof globalThis.fetch })
    ).toBe(false);
    warn.mockRestore();
  });
});
// dry-copy-end
