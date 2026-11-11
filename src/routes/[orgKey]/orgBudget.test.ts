/**
 * The organization page as an admin sees it. The screen budget suite answers every read with values
 * that hold no role, so it runs the page as a member; an admin's page also reads the pending
 * membership requests, and that read is the banner's own later part, never the list's load.
 */
import { describe, expect, it } from 'vitest';
import { expectWithinBudget } from '#lib/telemetry/testing.ts';
import { budgets } from '#lib/telemetry/budgets.ts';
import { answer, hardLoad, hardLoadEvent, routeLoads } from '#lib/test-support/screenBudget.ts';

const route = '/[orgKey]';
const modules = import.meta.glob([
  '/src/routes/+layout.server.ts',
  '/src/routes/[orgKey]/+layout.server.ts',
  '/src/routes/[orgKey]/+page.server.ts'
]);

/** Every read as the suite answers it, but the viewer's memberships name them an admin of the organization. */
function asAdmin(input: RequestInfo | URL): Response {
  const url = new URL(input instanceof Request ? input.url : String(input), 'https://apibuilder.org');
  if (url.pathname.endsWith('/memberships')) {
    return new Response(JSON.stringify([{ guid: 'm-1', role: 'admin' }]), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }
  return answer(input);
}

describe('the organization page for an admin', () => {
  it('shows after its three reads, none waiting on another, the pending requests filling in after', async () => {
    const run = await expectWithinBudget(hardLoad(await routeLoads(route, modules)), hardLoadEvent(route), asAdmin, { budgets });

    const operations = run.calls.map((call) => `${call.part} ${call.operation}`);
    expect(operations).toContain('later:pendingRequests GET /apibuilder/membership/requests');
    expect(run.load).toEqual({ calls: 3, waits: 0 });
    expect(run.peaks.later).toBe(1);
  });
});
