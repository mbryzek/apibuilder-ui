// dry-copy: sveltekit/screen-report/budget — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * One budget holds every screen, and a screen overrides only what differs.
 *
 * `globalBudget` is the budget of every screen that says nothing. A screen that needs a different
 * limit adds `src/routes/<route>/budget.ts` beside its `+page` files, exporting only the fields it
 * overrides:
 *
 *     import type { BudgetOverride } from 'admin-ui/telemetry/budget';
 *     export const budget: BudgetOverride = { load: { calls: 5 } };
 *
 * It sits beside the route rather than inside `+page.ts` because SvelteKit refuses an unknown export
 * from a `+page` module. An override is a diff in the screen's own pull request, reviewed like any
 * code; raising the global budget is one change to this region, written into every app by
 * `dev repo copies propagate`.
 *
 * THE OVERRIDES ARE READ AT BUILD TIME, BY THE APP. `import.meta.glob` is resolved by the build of
 * the module that holds it, and only the app knows its routes, so the app writes the glob once and
 * hands it here:
 *
 *     export const budgets = budgetTable(import.meta.glob('/src/routes/**\/budget.ts', { eager: true }));
 *
 * The resolved budget is stamped into every report, so an alert compares a report against the
 * budget it was held to and no second copy of the budgets lives in the monitoring repo.
 */

/** What a screen is held to. */
export interface Budget {
  /** Time to show, in milliseconds, held at p90 and p95: LCP for a hard load, the navigation's own time for a soft one. */
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

/** A screen's `budget.ts`: only the fields it overrides; every field it leaves out stays global. */
export interface BudgetOverride {
  showMs?: number;
  load?: { calls?: number; waits?: number };
  parts?: number;
  poll?: number;
}

export const globalBudget: Budget = Object.freeze({
  showMs: 500,
  load: Object.freeze({ calls: 3, waits: 2 }),
  parts: 1,
  poll: 1
});

/** The override a module exports, as the glob hands it over. */
export interface BudgetModule {
  budget?: BudgetOverride;
}

/** Route id to its override, built once from the app's glob. */
export type BudgetTable = ReadonlyMap<string, BudgetOverride>;

const ROUTES_PREFIX = '/src/routes';
const FILE_SUFFIX = '/budget.ts';

/**
 * The route id a `budget.ts` path belongs to: `/src/routes/issues/[id]/budget.ts` is `/issues/[id]`,
 * and the root's own `/src/routes/budget.ts` is `/`. Null for a path outside `src/routes`.
 */
export function routeOfBudgetFile(path: string): string | null {
  if (!path.startsWith(ROUTES_PREFIX) || !path.endsWith(FILE_SUFFIX)) return null;
  const route = path.slice(ROUTES_PREFIX.length, path.length - FILE_SUFFIX.length);
  return route === '' ? '/' : route;
}

/** The table of every override, keyed by route id. A module exporting no `budget` overrides nothing. */
export function budgetTable(modules: Record<string, BudgetModule>): BudgetTable {
  const table = new Map<string, BudgetOverride>();
  for (const [path, module] of Object.entries(modules)) {
    const route = routeOfBudgetFile(path);
    if (route !== null && module.budget !== undefined) table.set(route, module.budget);
  }
  return table;
}

/** `override` laid over the global budget, field by field. */
export function resolveBudget(override: BudgetOverride | undefined, base: Budget = globalBudget): Budget {
  return {
    showMs: override?.showMs ?? base.showMs,
    load: {
      calls: override?.load?.calls ?? base.load.calls,
      waits: override?.load?.waits ?? base.load.waits
    },
    parts: override?.parts ?? base.parts,
    poll: override?.poll ?? base.poll
  };
}

/** The budget a route is held to: its own override over the global one. An unmatched route is held to the global budget. */
export function budgetFor(route: string | null, table: BudgetTable = new Map()): Budget {
  return resolveBudget(route === null ? undefined : table.get(route));
}
// dry-copy-end
