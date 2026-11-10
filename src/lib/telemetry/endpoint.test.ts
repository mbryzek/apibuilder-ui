// dry-copy: sveltekit/screen-report/endpoint-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it, vi } from 'vitest';
import { budgetTable } from './budget';
import { MAX_REPORT_BYTES, PostLimiter, telemetryHandler } from './endpoint';
import { decodeLogs } from './otlp.test.decode';

const VIEW = 'sv_0123456789abcdef0123456789abcdef';
const half = {
  half: 'browser',
  view: VIEW,
  route: '/issues/[id]',
  calls: [],
  dropped_calls: 0,
  polls: {},
  timing: { navigation: 'hard', show_ms: 640, inp_ms: 80, finished_ms: 900 }
};

function post(body: string, headers: Record<string, string> = {}): { request: Request; getClientAddress: () => string } {
  return {
    request: new Request('https://admin.test/_telemetry', {
      method: 'POST',
      body,
      headers: { 'sec-fetch-site': 'same-origin', ...headers }
    }),
    getClientAddress: () => '203.0.113.9'
  };
}

function door(fetch = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 204 }))) {
  return {
    fetch,
    config: {
      app: 'idempotent',
      repo: 'mbryzek/idempotent',
      token: () => 'tok',
      fetch: fetch as unknown as typeof globalThis.fetch,
      budgets: budgetTable({ '/src/routes/issues/[id]/budget.ts': { budget: { showMs: 800 } } })
    }
  };
}

describe('/_telemetry', () => {
  it("forwards a browser half stamped with the server's budget for its route", async () => {
    const { fetch, config } = door();
    const response = await telemetryHandler(config)(post(JSON.stringify({ ...half, budget: { showMs: 1 } })));
    expect(response.status).toBe(204);
    const record = decodeLogs(fetch.mock.calls[0]![1]?.body as Uint8Array);
    expect(record.attributes['screen.budget.show_ms']).toBe(800);
    expect(record.attributes['screen.show_ms']).toBe(640);
    expect(record.attributes['screen.report']).toBe('browser');
  });

  it('answers 413 over 64 KB, declared or not', async () => {
    const { config } = door();
    const big = JSON.stringify({ ...half, pad: 'x'.repeat(MAX_REPORT_BYTES) });
    expect((await telemetryHandler(config)(post(big))).status).toBe(413);
    expect((await telemetryHandler(config)(post('{}', { 'content-length': String(MAX_REPORT_BYTES + 1) }))).status).toBe(413);
  });

  it('answers 429 past 60 posts a minute from one address, and admits it again a minute later', async () => {
    const { config } = door();
    let now = 0;
    const handler = telemetryHandler(config, new PostLimiter(60, 60_000, () => now));
    const statuses: number[] = [];
    for (let i = 0; i < 61; i += 1) statuses.push((await handler(post(JSON.stringify(half)))).status);
    expect(statuses.filter((s) => s === 204)).toHaveLength(60);
    expect(statuses.at(-1)).toBe(429);
    now = 60_000;
    expect((await handler(post(JSON.stringify(half)))).status).toBe(204);
  });

  it('answers 400 to a body that is not a browser half, and 403 to a cross-site post', async () => {
    const { fetch, config } = door();
    expect((await telemetryHandler(config)(post('not json'))).status).toBe(400);
    expect((await telemetryHandler(config)(post(JSON.stringify({ ...half, view: 'x' })))).status).toBe(400);
    expect((await telemetryHandler(config)(post(JSON.stringify(half), { 'sec-fetch-site': 'cross-site' }))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('hands the post to waitUntil where the platform has one', async () => {
    const { config } = door();
    const waitUntil = vi.fn();
    const response = await telemetryHandler(config)({ ...post(JSON.stringify(half)), platform: { ctx: { waitUntil } } });
    expect(response.status).toBe(204);
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});
// dry-copy-end
