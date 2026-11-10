import type { BudgetOverride } from '#lib/telemetry/budget.ts';

// Where this screen is over the global budget (DES-65431): calls, waits and parts are what its budget test counts (screenBudgets.test.ts).
// Each field is a debt of this screen, and lowering it is the fix.
export const budget: BudgetOverride = { load: { calls: 5, waits: 3 } };
