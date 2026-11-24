// dry-copy: sveltekit/screen-report/budget — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * What a screen is held to is a platform record (DES-139972), never a file in the repository: the
 * global budget every screen is held to, and a screen's own row above it on one measure, which is
 * either debt (carried over from an old override, and only ever lowered) or an exception a person
 * approved. Nobody writes a row by hand. A session reads a screen's budget with
 * `dev budgets show <app> <route>` and asks for an exception with `dev budgets request`, the line a
 * failing screen budget test prints.
 *
 * The screen budget test reads the record once before its first route (`budgetRecord.ts`) and holds
 * each route to {@link budgetFor} of it; the production alerts read the same record, so a report
 * carries no budget of its own.
 */

/** What a screen is held to. */
export interface Budget {
  /**
   * Time to show, in milliseconds, held at p95: for a hard load, LCP less its connect phase
   * (`screen.phase.connect_ms`: DNS, TCP and TLS, the client's network rather than the screen's);
   * for a soft one, the navigation's own time. Measured only in production.
   */
  showMs: number;
  /** What the screen waits for before it shows, layouts included. */
  load: {
    /** Calls before the screen shows. */
    calls: number;
    /** Of those, the calls issued after the load awaited an earlier one. */
    waits: number;
  };
  /** Calls per part that fills in after (`later`), and per app endpoint call. */
  parts: number;
  /** Calls per poll: a poll's budget is per tick, so a screen left open is not over budget for being open. */
  poll: number;
}

/** One measure a screen is held to, as the record names it. */
export type Measure = 'show_ms' | 'load_calls' | 'load_waits' | 'parts' | 'poll';

/** Every measure, in the record's order. */
export const MEASURES: readonly Measure[] = Object.freeze(['show_ms', 'load_calls', 'load_waits', 'parts', 'poll']);

/** What holds a screen's budget on one measure: the global budget, its debt row or its exception row. */
export type Holder = 'global' | 'debt' | 'exception';

/** One measure of one screen: the budget in force, what holds it, and the global budget beside it. */
export interface Held {
  value: number;
  heldBy: Holder;
  global: number;
}

/** A screen's own row on one measure. */
export interface ScreenRow {
  kind: 'debt' | 'exception';
  value: number;
}

/** The record as one app's screen budget test reads it. */
export interface BudgetRecord {
  /** The app, as its screen reports name it (`screen.app`). */
  app: string;
  /** Its repository, `owner/name`. */
  repository: string;
  global: Readonly<Record<Measure, number>>;
  /** Route id to the rows it has, by measure; a route with none is held to the global budget. */
  rows: ReadonlyMap<string, Readonly<Partial<Record<Measure, ScreenRow>>>>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMeasure(value: unknown): value is Measure {
  return typeof value === 'string' && (MEASURES as readonly string[]).includes(value);
}

function count(value: unknown, what: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0)
    throw new Error(`${what} is not a whole number: ${String(value)}`);
  return value;
}

/**
 * The record from platform's answer to `GET /agent/budgets/screens?repository=` (`screen_budget_rows`),
 * keeping the rows of `app`. Throws on an answer it cannot read, or one missing a measure of the
 * global budget: a screen is never held to a budget nobody recorded.
 */
export function budgetRecord(app: string, answer: unknown): BudgetRecord {
  if (!isObject(answer)) throw new Error('the screen budget record is not an object');
  const repository = typeof answer['repository'] === 'string' ? answer['repository'] : '';
  if (!Array.isArray(answer['global']) || !Array.isArray(answer['budgets']))
    throw new Error('the screen budget record holds no global and budgets lists');
  const global: Partial<Record<Measure, number>> = {};
  for (const row of answer['global']) {
    if (isObject(row) && isMeasure(row['measure'])) global[row['measure']] = count(row['value'], `the global ${row['measure']}`);
  }
  const missing = MEASURES.filter((measure) => global[measure] === undefined);
  if (missing.length > 0) throw new Error(`the screen budget record has no global budget for ${missing.join(', ')}`);
  const rows = new Map<string, Partial<Record<Measure, ScreenRow>>>();
  for (const row of answer['budgets']) {
    if (!isObject(row) || row['app'] !== app || typeof row['route'] !== 'string' || !isMeasure(row['measure'])) continue;
    const kind = row['kind'] === 'exception' ? 'exception' : 'debt';
    const of = rows.get(row['route']) ?? {};
    of[row['measure']] = { kind, value: count(row['value'], `${row['route']} ${row['measure']}`) };
    rows.set(row['route'], of);
  }
  return { app, repository, global: global as Record<Measure, number>, rows };
}

/** What holds `route` on `measure`: its own row, else the global budget. A null route is held to the global budget. */
export function heldFor(route: string | null, measure: Measure, record: BudgetRecord): Held {
  const global = record.global[measure];
  const row = route === null ? undefined : record.rows.get(route)?.[measure];
  return row === undefined ? { value: global, heldBy: 'global', global } : { value: row.value, heldBy: row.kind, global };
}

/** The budget `route` is held to, every measure. */
export function budgetFor(route: string | null, record: BudgetRecord): Budget {
  const value = (measure: Measure) => heldFor(route, measure, record).value;
  return {
    showMs: value('show_ms'),
    load: { calls: value('load_calls'), waits: value('load_waits') },
    parts: value('parts'),
    poll: value('poll')
  };
}

/** A record that holds no screen to anything: what a measuring run counts against. */
export function unlimitedRecord(app: string, repository = ''): BudgetRecord {
  const unlimited = 1_000_000;
  return {
    app,
    repository,
    global: { show_ms: unlimited, load_calls: unlimited, load_waits: unlimited, parts: unlimited, poll: unlimited },
    rows: new Map()
  };
}

/** The global budget platform seeds, for a test that builds its record in place. */
export const SEEDED_GLOBAL: Readonly<Record<Measure, number>> = Object.freeze({
  show_ms: 500,
  load_calls: 3,
  load_waits: 2,
  parts: 1,
  poll: 1
});

/**
 * A record built in place, for a test that holds a harness route to fixed numbers: each route's
 * measures as debt rows, every other measure and route held to `global`. A screen budget suite
 * never uses one: it reads the record platform holds (`budgetRecord.ts`).
 */
export function fixedRecord(
  app: string,
  routes: Record<string, Partial<Record<Measure, number>>>,
  global: Readonly<Record<Measure, number>> = SEEDED_GLOBAL
): BudgetRecord {
  const rows = new Map<string, Partial<Record<Measure, ScreenRow>>>();
  for (const [route, measures] of Object.entries(routes)) {
    const of: Partial<Record<Measure, ScreenRow>> = {};
    for (const measure of MEASURES) {
      const value = measures[measure];
      if (value !== undefined) of[measure] = { kind: 'debt', value };
    }
    rows.set(route, of);
  }
  return { app, repository: '', global: { ...global }, rows };
}

/** How a holder reads in a failure: who owns the number, and how it moves. */
export function describeHolder(held: Held): string {
  switch (held.heldBy) {
    case 'global':
      return 'the global budget';
    case 'debt':
      return `its debt row (global ${held.global}), which only goes down`;
    case 'exception':
      return `its approved exception (global ${held.global})`;
  }
}

/**
 * The line that asks a person for an exception on `route`'s `measure` at `value`. The reason and the
 * evidence are the requester's: what the screen shows that costs the excess, and this test's output.
 */
export function requestLine(app: string, route: string, measure: Measure, value: number): string {
  return `dev budgets request ${app} '${route}' --measure ${measure} --value ${value} --reason "<what the screen shows that costs the excess>" --evidence-file <this test's output, saved>`;
}
// dry-copy-end
