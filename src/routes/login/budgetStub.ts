import type { ScreenStub } from '#lib/test-support/screenBudget.ts';

// A signed-in session is sent on to the home page; the hard load runs signed in, so it ends there.
export const stub: ScreenStub = { redirects: true };
