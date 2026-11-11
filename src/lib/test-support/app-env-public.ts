/**
 * Test double for `$app/env/public`, aliased over the real module in vitest.config.ts.
 *
 * A test run is built as no release, so the screen report stamps no `screen.release`, as a dev
 * run does. A suite that asserts the stamp mocks the module with a version of its own.
 */

export const PUBLIC_VERSION: string | undefined = undefined;
