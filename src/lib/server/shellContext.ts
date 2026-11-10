import type { CallContext } from '#lib/telemetry/context.ts';
import { ViewRecorder } from '#lib/telemetry/recorder.ts';

/**
 * The context of a call the request hook makes for every request, before any screen view opens: the
 * session check. It records into a view nobody reports, so the app shell's own read is never billed
 * to the screen a request happens to be for.
 *
 * A fresh one each time: a detached recorder keeps what it is handed, and one shared across requests
 * would grow for the life of the isolate.
 */
export function shellCtx(): CallContext {
  return { route: null, view: 'detached', part: 'load', recorder: new ViewRecorder('detached', null, { side: 'server' }) };
}
