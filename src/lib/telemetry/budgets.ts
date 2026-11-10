import { budgetTable } from './budget';

/**
 * Every screen's `budget.ts` override, keyed by route id (DES-65431). The glob is resolved by this
 * app's build, which is the only one that knows its routes; the hook stamps a screen's resolved
 * budget into each report, and a route's budget test reads the same table.
 */
export const budgets = budgetTable(import.meta.glob('/src/routes/**/budget.ts', { eager: true }));
