// dry-copy: sveltekit/screen-report/budget-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import { budgetFor, budgetTable, globalBudget, resolveBudget, routeOfBudgetFile } from './budget';

describe('globalBudget', () => {
  it('is the design: 500 ms to show, 3 calls before showing, 2 of them waiting, 1 per later part and per poll', () => {
    expect(globalBudget).toEqual({ showMs: 500, load: { calls: 3, waits: 2 }, parts: 1, poll: 1 });
  });
});

describe('routeOfBudgetFile', () => {
  it('reads the route id from the path the glob hands over', () => {
    expect(routeOfBudgetFile('/src/routes/issues/[id]/budget.ts')).toBe('/issues/[id]');
    expect(routeOfBudgetFile('/src/routes/(app)/admin/budget.ts')).toBe('/(app)/admin');
    expect(routeOfBudgetFile('/src/routes/budget.ts')).toBe('/');
    expect(routeOfBudgetFile('/src/lib/budget.ts')).toBeNull();
  });
});

describe('resolving a screen budget', () => {
  it('keeps every field an override leaves out', () => {
    expect(resolveBudget({ load: { calls: 5 } })).toEqual({ showMs: 500, load: { calls: 5, waits: 2 }, parts: 1, poll: 1 });
  });

  it('holds a route to its own override, and every other route to the global budget', () => {
    const table = budgetTable({
      '/src/routes/issues/[id]/budget.ts': { budget: { showMs: 900 } },
      '/src/routes/empty/budget.ts': {}
    });
    expect(budgetFor('/issues/[id]', table).showMs).toBe(900);
    expect(budgetFor('/empty', table)).toEqual(globalBudget);
    expect(budgetFor(null, table)).toEqual(globalBudget);
  });
});
// dry-copy-end
