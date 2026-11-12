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
 * Each screen runs a second time against empty answers (`emptyAnswer`), every list its own loads read
 * with no rows while its layouts' calls answer in full, held to the same budget: a call a load makes
 * only when a list is empty is counted there. That run may stop at a 404 or a redirect, since it only
 * adds a branch to the full run. ISS-78653
 *
 * The full run's hard load that throws fails its route, naming what it threw (`unexpectedEnd`): a load
 * that stopped at a redirect or a 403 made only the calls before it, so its count says nothing about
 * the screen. A screen the generic answer does not reach gets a `budgetStub.ts` whose fields reach it
 * (both runs read them); one whose load redirects on purpose sets `redirects: true` in its own stub,
 * and then must end in a redirect.
 *
 * `SCREEN_BUDGET_MEASURE=<file>` measures instead of holding: every route runs against an unlimited
 * budget and its counts are written to the file, which is how an override is first measured.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { expectWithinBudget, type BudgetRun } from '#lib/telemetry/testing.ts';
import type { BudgetOverride } from '#lib/telemetry/budget.ts';
import { budgets } from '#lib/telemetry/budgets.ts';
import {
  answer,
  answerWith,
  describeThrown,
  emptyAnswer,
  hardLoad,
  hardLoadEvent,
  layoutsOf,
  noting,
  routeLoads,
  routeOfPage,
  stubTable,
  unexpectedEnd,
  type ScreenStubModule
} from '#lib/test-support/screenBudget.ts';

const pages = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'));
const modules = import.meta.glob([
  '/src/routes/**/+page.server.ts',
  '/src/routes/**/+page.ts',
  '/src/routes/**/+layout.server.ts',
  '/src/routes/**/+layout.ts'
]);
const routes = pages.map(routeOfPage).sort();
const stubs = stubTable(import.meta.glob<ScreenStubModule>('/src/routes/**/budgetStub.ts', { eager: true }));

const measuring = process.env['SCREEN_BUDGET_MEASURE'];
const unlimited: BudgetOverride = { load: { calls: 1_000, waits: 1_000 }, parts: 1_000, poll: 1_000 };
const measured: Record<string, Pick<BudgetRun, 'load' | 'peaks' | 'unrecorded'> & { thrown: string[] }> = {};

/** Records a route's counted run under `name` when measuring. */
function measure(name: string, run: BudgetRun, thrown: unknown[]): void {
  if (!measuring) return;
  const threw = thrown.map(describeThrown);
  measured[name] = { load: run.load, peaks: run.peaks, unrecorded: run.unrecorded, thrown: threw };
}

describe('every screen stays within its budget', () => {
  it('finds the screens', () => {
    expect(routes).toContain('/[orgKey]/[appKey]/[version]');
    expect(routes.length).toBeGreaterThanOrEqual(30);
  });

  it.each(routes)('%s', async (route) => {
    const thrown: unknown[] = [];
    const load = hardLoad(await routeLoads(route, modules), thrown);
    const table = measuring ? new Map([[route, unlimited]]) : budgets;
    const stub = stubs.get(route);
    const run = await expectWithinBudget(load, hardLoadEvent(route), answerWith(stub?.fields), { budgets: table });
    measure(route, run, thrown);
    if (!measuring)
      expect(
        unexpectedEnd(thrown, stub?.redirects),
        `${route}'s hard load did not reach its end, so its budget counted only part of it`
      ).toEqual([]);
  });

  it.each(routes)('%s, every list empty', async (route) => {
    const thrown: unknown[] = [];
    const loads = await routeLoads(route, modules);
    const shell = new Set<string>();
    const fields = stubs.get(route)?.fields;
    const asLayouts = { budgets: new Map([[route, unlimited]]) };
    await expectWithinBudget(hardLoad(layoutsOf(loads)), hardLoadEvent(route), noting(answerWith(fields), shell), asLayouts);
    const table = measuring ? new Map([[route, unlimited]]) : budgets;
    const run = await expectWithinBudget(hardLoad(loads, thrown), hardLoadEvent(route), emptyAnswer(shell, fields), { budgets: table });
    measure(`${route} (empty)`, run, thrown);
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
