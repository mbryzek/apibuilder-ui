// dry-copy: sveltekit/screen-report/budget-record-test — every copy of this region must match; `dev repo copies` checks it (DES-139972)
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { budgetRecordSetup, readBudgetRecord, runsBudgetSpecs, ScreenBudgetCounts, UNMEASURED, type DevRunner } from './budgetRecord';

const ROWS = {
  repository: 'mbryzek/hoa-app',
  global: ['show_ms', 'load_calls', 'load_waits', 'parts', 'poll'].map((measure) => ({ measure, value: 3 })),
  budgets: []
};

function runner(...answers: ({ ok: true; stdout: string } | { ok: false; why: string })[]): DevRunner & { asked: string[][] } {
  const asked: string[][] = [];
  const run = (args: string[]) => {
    asked.push(args);
    return Promise.resolve(answers.shift() ?? { ok: false as const, why: 'no answer' });
  };
  return Object.assign(run, { asked });
}

describe('readBudgetRecord', () => {
  it('reads the record with dev budgets show, retrying a failure', async () => {
    const run = runner({ ok: false, why: 'platform answered 503' }, { ok: true, stdout: JSON.stringify(ROWS) });
    const lines: string[] = [];
    expect(await readBudgetRecord('hoa-app', { run, pauseMs: 0, log: (line) => lines.push(line) })).toEqual(ROWS);
    expect(run.asked).toEqual([
      ['budgets', 'show', 'hoa-app', '--json'],
      ['budgets', 'show', 'hoa-app', '--json']
    ]);
    expect(lines).toEqual(['screen budget record: dev budgets show hoa-app --json, attempt 1 of 4: platform answered 503']);
  });

  it('answers null when no attempt read a record, an unreadable answer included', async () => {
    const run = runner({ ok: true, stdout: 'not json' }, { ok: true, stdout: '{"global": []}' });
    expect(await readBudgetRecord('hoa-app', { run, attempts: 2, pauseMs: 0, log: () => undefined })).toBeNull();
  });
});

describe('budgetRecordSetup', () => {
  it('provides the record to every spec', async () => {
    const provided: unknown[] = [];
    await budgetRecordSetup('hoa-app', { run: runner({ ok: true, stdout: JSON.stringify(ROWS) }), argv: ['run'] })({
      provide: (_, value) => provided.push(value)
    });
    expect(provided).toEqual([ROWS]);
  });

  it('exits 75, unmeasured, when platform does not answer', async () => {
    const exit = (code: number): never => {
      throw new Error(`exit ${code}`);
    };
    const setup = budgetRecordSetup('hoa-app', { run: runner(), attempts: 1, pauseMs: 0, log: () => undefined, argv: ['run'], exit });
    await expect(setup({ provide: () => undefined })).rejects.toThrow(`exit ${UNMEASURED}`);
  });

  it('reads nothing for a run of spec files none of which is a budget spec', async () => {
    const run = runner();
    await budgetRecordSetup('hoa-app', { run, argv: ['run', 'src/lib/date.test.ts'] })({ provide: () => undefined });
    expect(run.asked).toEqual([]);
  });
});

describe('runsBudgetSpecs', () => {
  it('reads the spec filters of a vitest run', () => {
    expect(runsBudgetSpecs(['run', '--passWithNoTests', '--reporter=junit'])).toBe(true);
    expect(runsBudgetSpecs(['run', 'src/routes/screenBudgets.test.ts'])).toBe(true);
    expect(runsBudgetSpecs(['run', '-t', 'lean', 'src/lib/date.test.ts'])).toBe(false);
    expect(runsBudgetSpecs(['run', 'src/lib/date.test.ts'])).toBe(false);
  });
});

describe('ScreenBudgetCounts', () => {
  it("writes each route's most per measure, complete once every route it owns was counted", () => {
    const counts = new ScreenBudgetCounts('hoa-app', 'rest', ['rest', 'admin'], ['/a', '/b']);
    counts.note('/a', { load: { calls: 2, waits: 1 }, peaks: { later: 0, poll: 0 } });
    counts.note('/a', { load: { calls: 1, waits: 0 }, peaks: { later: 3, poll: 1 } });
    expect(counts.toJSON().complete).toBe(false);
    counts.note('/b', { load: { calls: 1, waits: 0 }, peaks: { later: 0, poll: 0 } });
    const root = mkdtempSync(join(tmpdir(), 'counts-'));
    counts.write(root);
    expect(JSON.parse(readFileSync(join(root, 'ci-test-reports/screen-budget/rest.json'), 'utf8'))).toEqual({
      app: 'hoa-app',
      shard: 'rest',
      shards: ['admin', 'rest'],
      complete: true,
      routes: [
        { route: '/a', load_calls: 2, load_waits: 1, parts: 3, poll: 1 },
        { route: '/b', load_calls: 1, load_waits: 0, parts: 0, poll: 0 }
      ]
    });
  });
});
// dry-copy-end
