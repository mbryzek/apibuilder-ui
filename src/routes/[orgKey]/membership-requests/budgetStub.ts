import type { ScreenStub } from '#lib/test-support/screenBudget.ts';

// Only an admin of the organization sees its requests: a member is refused with a 403 before the list is read.
export const stub: ScreenStub = { fields: { role: 'admin' } };
