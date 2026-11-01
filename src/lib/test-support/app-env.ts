/**
 * Test double for `$app/env`, aliased over the real module in vitest.config.ts.
 *
 * SvelteKit serves that module only inside a running app. Every suite here runs as plain modules on
 * Node, which is the server side of the app, so `browser` says so.
 */

export const browser = false;
export const dev = true;
