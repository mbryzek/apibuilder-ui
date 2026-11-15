import type { ScreenStub } from '#lib/test-support/screenBudget.ts';

// With no `q` the screen reads nothing, so it is measured on a query; `offset` pages the results.
export const stub: ScreenStub = { search: '?q=user', bareParams: ['offset'] };
