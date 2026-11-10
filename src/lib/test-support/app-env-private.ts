/**
 * Test double for `$app/env/private`, aliased over the real module in vitest.config.ts.
 *
 * No suite here has a report token, which is what a dev run holds too: the screen report then
 * posts nothing (`#lib/server/screenReport.ts`).
 */

export const OBS_REPORT_TOKEN: string | undefined = undefined;
