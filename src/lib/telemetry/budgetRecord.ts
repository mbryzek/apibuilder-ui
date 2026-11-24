// dry-copy: sveltekit/screen-report/budget-record — every copy of this region must match; `dev repo copies` checks it (DES-139972)
/**
 * THE SCREEN BUDGET TEST READS THE RECORD BEFORE IT RUNS (DES-139972). Every route is held to the
 * platform record's rows (`budget.ts`), read once per run by vitest's global setup, in the main
 * process, and handed to every spec with `provide`:
 *
 *     // vite.config.ts
 *     test: { globalSetup: ['src/lib/test/budgetRecord.setup.ts'] }
 *     // src/lib/test/budgetRecord.setup.ts
 *     export default budgetRecordSetup('hoa-app');
 *     // the suite
 *     const record = suiteRecord('hoa-app');
 *
 * The read is `dev budgets show <app> --json`, which presents this machine's runner identity, the
 * fleet token the record's screen reads answer. It is retried, and when platform still does not
 * answer the run exits 75, unmeasured (`rules/ci.test.steps.mdc`): never a pass, and never the
 * global budget standing in for the record. A run that names spec files, none of them a budget
 * spec, reads nothing.
 *
 * THE SUITE WRITES WHAT IT COUNTED, one file per shard, `ci-test-reports/screen-budget/<shard>.json`
 * ({@link ScreenBudgetCounts}): a full main build's counts lower a debt row to what the screen costs.
 */
import { execFile } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { inject } from 'vitest';
import { budgetRecord, type BudgetRecord } from './budget';

declare module 'vitest' {
  export interface ProvidedContext {
    screenBudgetRecord?: unknown;
  }
}

/** The exit code of a run that measured nothing: the fleet's 75. */
export const UNMEASURED = 75;

/** Runs `dev` with `args`; its stdout, or why it failed. */
export type DevRunner = (args: string[]) => Promise<{ ok: true; stdout: string } | { ok: false; why: string }>;

const runDev: DevRunner = (args) =>
  new Promise((resolve) => {
    execFile('dev', args, { maxBuffer: 64 * 1024 * 1024, timeout: 60_000 }, (error, stdout, stderr) => {
      if (error === null) resolve({ ok: true, stdout });
      else
        resolve({
          ok: false,
          why: `${error.message.split('\n')[0]}${stderr.trim() === '' ? '' : `: ${stderr.trim().split('\n').slice(-3).join(' ')}`}`
        });
    });
  });

export interface ReadOptions {
  run?: DevRunner;
  attempts?: number;
  pauseMs?: number;
  log?: (line: string) => void;
}

/**
 * Platform's answer for `app`'s repository, read with `dev budgets show <app> --json` and checked by
 * {@link budgetRecord}; null when no attempt got an answer it could read, each failure logged.
 */
export async function readBudgetRecord(app: string, options: ReadOptions = {}): Promise<unknown> {
  const { run = runDev, attempts = 4, pauseMs = 5_000, log = (line) => console.error(line) } = options;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const answer = await run(['budgets', 'show', app, '--json']);
    let why: string;
    if (answer.ok) {
      try {
        const parsed: unknown = JSON.parse(answer.stdout);
        budgetRecord(app, parsed);
        return parsed;
      } catch (error) {
        why = error instanceof Error ? error.message : String(error);
      }
    } else why = answer.why;
    log(`screen budget record: dev budgets show ${app} --json, attempt ${attempt} of ${attempts}: ${why}`);
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, pauseMs));
  }
  return null;
}

// vitest's flags that take the next argument as their value, so it is not read as a spec filter.
const VALUED_FLAGS = new Set([
  '-t',
  '--testNamePattern',
  '--project',
  '-c',
  '--config',
  '-r',
  '--root',
  '--dir',
  '--shard',
  '--environment',
  '--pool',
  '--reporter',
  '--outputFile'
]);

/** Whether a vitest run with these arguments can run a budget spec: it names no spec files, or names one. */
export function runsBudgetSpecs(argv: readonly string[]): boolean {
  const filters: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg.startsWith('-')) {
      if (VALUED_FLAGS.has(arg)) i += 1;
    } else if (!['run', 'watch', 'dev', 'related'].includes(arg) && !/(^|\/)vitest(\.m?js)?$/.test(arg)) filters.push(arg);
  }
  return filters.length === 0 || filters.some((filter) => /budget/i.test(filter));
}

/** The vitest global setup that reads `app`'s record and provides it to every spec, or exits 75. */
export function budgetRecordSetup(app: string, options: ReadOptions & { argv?: readonly string[]; exit?: (code: number) => never } = {}) {
  return async (project: { provide: (key: 'screenBudgetRecord', value: unknown) => void }): Promise<void> => {
    const { argv = process.argv.slice(2), exit = (code: number) => process.exit(code) } = options;
    if (!runsBudgetSpecs(argv)) return;
    const answer = await readBudgetRecord(app, options);
    if (answer === null) {
      console.error(
        `screen budget record: platform did not answer for ${app}, so no screen can be held to its budget; exiting ${UNMEASURED}, unmeasured`
      );
      exit(UNMEASURED);
    }
    project.provide('screenBudgetRecord', answer);
  };
}

/** The record the global setup read, for `app`'s suite; throws when the run's config names no setup. */
export function suiteRecord(app: string): BudgetRecord {
  const answer = inject('screenBudgetRecord');
  if (answer === undefined)
    throw new Error(
      `the screen budget record was not read before this run: vite.config.ts's test.globalSetup must name ${app}'s budgetRecord setup`
    );
  return budgetRecord(app, answer);
}

/** What one route counted on the call measures: the most any case of it counted. */
export interface RouteCounts {
  route: string;
  load_calls: number;
  load_waits: number;
  parts: number;
  poll: number;
}

/** What a budget run counted, as {@link ScreenBudgetCounts.note} reads it. */
export interface CountedRun {
  load: { calls: number; waits: number };
  peaks: { later: number; poll: number };
}

/**
 * One shard's per-route counts, written to `ci-test-reports/screen-budget/<shard>.json` once the
 * shard has run: `{app, shard, shards, complete, routes}`. `shards` is every shard the suite
 * defines, the same list in every file; `complete` says the shard counted every route it owns.
 */
export class ScreenBudgetCounts {
  private readonly counted = new Map<string, RouteCounts>();

  constructor(
    readonly app: string,
    readonly shard: string,
    readonly shards: readonly string[],
    readonly routes: readonly string[]
  ) {}

  /** Keeps the most of each measure `route` has counted. */
  note(route: string | null, run: CountedRun): void {
    if (route === null) return;
    const was = this.counted.get(route);
    this.counted.set(route, {
      route,
      load_calls: Math.max(was?.load_calls ?? 0, run.load.calls),
      load_waits: Math.max(was?.load_waits ?? 0, run.load.waits),
      parts: Math.max(was?.parts ?? 0, run.peaks.later),
      poll: Math.max(was?.poll ?? 0, run.peaks.poll)
    });
  }

  /** The file's contents. */
  toJSON(): { app: string; shard: string; shards: string[]; complete: boolean; routes: RouteCounts[] } {
    return {
      app: this.app,
      shard: this.shard,
      shards: [...this.shards].sort(),
      complete: this.routes.every((route) => this.counted.has(route)),
      routes: [...this.counted.values()].sort((a, b) => a.route.localeCompare(b.route))
    };
  }

  /** Writes the shard's file under `root`, the repository's. */
  write(root: string = process.cwd()): void {
    const dir = join(root, 'ci-test-reports', 'screen-budget');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${this.shard}.json`), `${JSON.stringify(this.toJSON(), null, 2)}\n`);
  }
}
// dry-copy-end
