import type { ScreenStub } from '#lib/test-support/screenBudget.ts';

// The token is found among the member's own by the route's guid, so a row must carry that id or the page is a 404.
export const stub: ScreenStub = { fields: { id: '1' } };
