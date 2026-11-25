/**
 * Every screen is held to its budget before merge (DES-65431): one test per route, each running the
 * route's hard load, layouts included, and failing, with every call named, when it makes more calls
 * than its budget allows: the platform record's row for the route, else the global budget (DES-139972). `#lib/test-support/screenBudget.ts`
 * says how the load is run and what the backend answers.
 *
 * The record is read once before the first spec (`budgetRecord.ts`); a run platform cannot answer
 * exits 75, unmeasured. A screen over its budget fails naming the measure, the budget, what holds it
 * and the count, and the `dev budgets request` line that asks a person for an exception; fitting
 * the screen inside it is the fix. Every route's counts are written to
 * `ci-test-reports/screen-budget/<shard>.json`, which a full main build reads to lower a debt row.
 *
 * Each screen's loads also declare what they stream: every promise a load returns is a part the
 * page fills in after, so it must be opened by `later`, and `expectWithinBudget` fails one that is
 * not, read from the data the hard load returns. Counted as `load`, its calls would bill the
 * screen's wait for calls the screen never waits on.
 *
 * Each screen runs a second time against empty answers (`emptyAnswer`), every list its own loads read
 * with no rows while its layouts' calls answer in full, held to the same budget: a call a load makes
 * only when a list is empty is counted there. That run may stop at a 404 or a redirect, since it only
 * adds a branch to the full run, and fails on any other throw (`unearnedEnd`). ISS-78653
 *
 * The full run's hard load that throws fails its route, naming what it threw (`unexpectedEnd`): a load
 * that stopped at a redirect or a 403 made only the calls before it, so its count says nothing about
 * the screen. A screen the generic answer does not reach gets a `budgetStub.ts` whose fields reach it
 * (both runs read them); one whose load redirects on purpose sets `redirects: true` in its own stub,
 * and then must end in a redirect.
 *
 * A route whose loads read a query parameter its hard load did not carry fails, naming it: it was
 * measured on the branch that parameter's absence takes. Its `budgetStub.ts` names the value people
 * open it with in `search`, or a parameter read on purpose with no value in `bareParams`
 * (`#lib/test-support/screenQuery.ts`). ISS-80720
 *
 * `SCREEN_BUDGET_MEASURE=<file>` measures instead of holding: every route runs against an unlimited
 * budget and its counts are written to the file, which is how a screen's cost is measured.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { expectWithinBudget, type BudgetRun } from '#lib/telemetry/testing.ts';
import { unlimitedRecord } from '#lib/telemetry/budget.ts';
import { ScreenBudgetCounts, suiteRecord } from '#lib/telemetry/budgetRecord.ts';
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
  unearnedEnd,
  unexpectedEnd,
  type ScreenStubModule
} from '#lib/test-support/screenBudget.ts';
import { unsetParameters, unsetParametersMessage } from '#lib/test-support/screenQuery.ts';

// `+page@<layout>.svelte` is a screen too, one that runs only the layouts down to the one it names.
const pages = Object.keys(import.meta.glob(['/src/routes/**/+page.svelte', '/src/routes/**/+page@*.svelte']));
const pageOf = new Map(pages.map((path) => [routeOfPage(path), path]));
const layouts = Object.keys(import.meta.glob(['/src/routes/**/+layout.svelte', '/src/routes/**/+layout@*.svelte']));
const modules = import.meta.glob([
  '/src/routes/**/+page.server.ts',
  '/src/routes/**/+page.ts',
  '/src/routes/**/+layout.server.ts',
  '/src/routes/**/+layout.ts'
]);
const routes = [...pageOf.keys()].sort();
const stubs = stubTable(import.meta.glob<ScreenStubModule>('/src/routes/**/budgetStub.ts', { eager: true }));

const measuring = process.env['SCREEN_BUDGET_MEASURE'];
const APP = 'apibuilder-ui';
// The platform record the run read before it started (`budgetRecord.ts`), and a record holding nothing for a measuring run.
const budgets = suiteRecord(APP);
const unlimited = unlimitedRecord(APP);
// What every route counted, written once the suite has run: a full main build's counts lower a debt row.
const counts = new ScreenBudgetCounts(APP, 'all', ['all'], routes);
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
    const load = hardLoad(await routeLoads(pageOf.get(route)!, modules, layouts), thrown);
    const table = measuring ? unlimited : budgets;
    const stub = stubs.get(route);
    const { event, read } = hardLoadEvent(route, stub);
    const run = await expectWithinBudget(load, event, answerWith(stub?.fields), { budgets: table, counts });
    measure(route, run, thrown);
    if (measuring) return;
    expect(
      unexpectedEnd(thrown, stub?.redirects),
      `${route}'s hard load did not reach its end, so its budget counted only part of it`
    ).toEqual([]);
    const unset = unsetParameters(read, event['url'] as URL, stub?.bareParams);
    expect(unset, unsetParametersMessage(route, unset, 'budgetStub.ts')).toEqual([]);
  });

  it.each(routes)('%s, every list empty', async (route) => {
    const thrown: unknown[] = [];
    const loads = await routeLoads(pageOf.get(route)!, modules, layouts);
    const shell = new Set<string>();
    const stub = stubs.get(route);
    const fields = stub?.fields;
    const asLayouts = { budgets: unlimited };
    await expectWithinBudget(hardLoad(layoutsOf(loads)), hardLoadEvent(route, stub).event, noting(answerWith(fields), shell), asLayouts);
    const table = measuring ? unlimited : budgets;
    const run = await expectWithinBudget(hardLoad(loads, thrown), hardLoadEvent(route, stub).event, emptyAnswer(shell, fields), {
      budgets: table,
      counts
    });
    measure(`${route} (empty)`, run, thrown);
    if (measuring) return;
    expect(
      unearnedEnd(thrown),
      `${route}'s hard load with every list empty ended in a throw other than a 404 or a redirect, so its budget counted only part of it`
    ).toEqual([]);
  });

  it('counts the reads a version screen makes, its layouts included', async () => {
    const route = '/[orgKey]/[appKey]/[version]';
    const run = await expectWithinBudget(
      hardLoad(await routeLoads(pageOf.get(route)!, modules, layouts)),
      hardLoadEvent(route).event,
      (input) => answer(input),
      {
        budgets
      }
    );
    expect(run.load.calls).toBeGreaterThan(0);
  });
});

afterAll(() => {
  counts.write();
  if (measuring) writeFileSync(measuring, JSON.stringify(measured, null, 2));
});
