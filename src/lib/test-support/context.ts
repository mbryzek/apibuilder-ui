import type { CallContext } from '#lib/telemetry/context.ts';
import { ViewRecorder } from '#lib/telemetry/recorder.ts';

/**
 * A call context recording into a view nobody reports, for a unit test that calls a helper taking
 * one directly (DES-65431). A route's budget test uses `expectWithinBudget` instead, which hands
 * the load real contexts and reads what they recorded.
 */
export function testCtx(): CallContext {
  return { route: null, view: 'detached', part: 'load', recorder: new ViewRecorder('detached', null, { side: 'server' }) };
}
