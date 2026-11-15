import type { ScreenStub } from '#lib/test-support/screenBudget.ts';

// `q` filters the list and `offset` pages it; the screen opens on every generator, first page.
export const stub: ScreenStub = { bareParams: ['offset', 'q'] };
