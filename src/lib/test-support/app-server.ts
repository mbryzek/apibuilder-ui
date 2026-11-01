/**
 * Test double for `$app/server`, aliased over the real module in vitest.config.ts.
 *
 * `ui/telemetry/api-event-reporter.ts`, which `hooks.server.ts` installs, asks it for the request
 * being served. No suite here serves one, and outside a request the real module throws, so this does.
 */

export function getRequestEvent(): never {
  throw new Error('getRequestEvent outside a request');
}
