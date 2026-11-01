/**
 * Test double for `cloudflare:workers`, aliased over the real module in vitest.config.ts.
 *
 * The Worker runtime serves that module, and under `vite dev` adapter-cloudflare's own Vite plugin
 * serves a stand-in for it. A test run has neither. Only what `src/` imports from the module is declared.
 */
export function waitUntil(_promise: Promise<unknown>): void {}
