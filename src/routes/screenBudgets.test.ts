/**
 * Every screen is held to its budget before merge (DES-65431): one test per route, each running the
 * route's hard load, layouts included, and failing, with every call named, when it makes more calls
 * than its budget allows (`globalBudget`, or the route's own `budget.ts`). `#lib/test-support/screenBudget.ts`
 * says how the load is run and what the backend answers.
 *
 * A screen over the global budget gets a `budget.ts` beside its `+page` files naming only what
 * differs; that override is the screen's named debt, and lowering it is the fix.
 *
 * Each screen's loads also declare what they stream: every promise a load returns is a part the
 * page fills in after, so it must be opened by `later`, and `expectWithinBudget` fails one that is
 * not, read from the data the hard load returns. Counted as `load`, its calls would bill the
 * screen's wait for calls the screen never waits on.
 *
 * `SCREEN_BUDGET_MEASURE=<file>` measures instead of holding: every route runs against an unlimited
 * budget and its counts are written to the file, which is how an override is first measured.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { expectWithinBudget, type BudgetRun } from '#lib/telemetry/testing.ts';
import type { BudgetOverride } from '#lib/telemetry/budget.ts';
import { budgets } from '#lib/telemetry/budgets.ts';
import { answer, hardLoad, hardLoadEvent, routeLoads, routeOfPage } from '#lib/test-support/screenBudget.ts';

const pages = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'));
const modules = import.meta.glob([
  '/src/routes/**/+page.server.ts',
  '/src/routes/**/+page.ts',
  '/src/routes/**/+layout.server.ts',
  '/src/routes/**/+layout.ts'
]);
const routes = pages.map(routeOfPage).sort();

const measuring = process.env['SCREEN_BUDGET_MEASURE'];
const unlimited: BudgetOverride = { load: { calls: 1_000, waits: 1_000 }, parts: 1_000, poll: 1_000 };
const measured: Record<string, Pick<BudgetRun, 'load' | 'peaks' | 'unrecorded'> & { thrown: string[] }> = {};

describe('every screen stays within its budget', () => {
  it('finds the screens', () => {
    expect(routes).toContain('/[orgKey]/[appKey]/[version]');
    expect(routes.length).toBeGreaterThanOrEqual(30);
  });

  it.each(routes)('%s', async (route) => {
    const thrown: unknown[] = [];
    const load = hardLoad(await routeLoads(route, modules), thrown);
    const table = measuring ? new Map([[route, unlimited]]) : budgets;
    const run = await expectWithinBudget(load, hardLoadEvent(route), (input) => answer(input), { budgets: table });
    if (measuring)
      measured[route] = {
        load: run.load,
        peaks: run.peaks,
        unrecorded: run.unrecorded,
        thrown: thrown.map((t) => (t instanceof Error ? String(t) : JSON.stringify(t)))
      };
  });

  it('counts the reads a version screen makes, its layouts included', async () => {
    const route = '/[orgKey]/[appKey]/[version]';
    const run = await expectWithinBudget(hardLoad(await routeLoads(route, modules)), hardLoadEvent(route), (input) => answer(input), {
      budgets
    });
    expect(run.load.calls).toBeGreaterThan(0);
  });
});

afterAll(() => {
  if (measuring) writeFileSync(measuring, JSON.stringify(measured, null, 2));
});
