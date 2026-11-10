import { telemetryHandler } from '#lib/telemetry/endpoint.ts';
import { screenReport } from '#lib/server/screenReport.ts';

/** The browser half of each screen view, posted once by `sendBeacon` when the view ends (DES-65431). */
export const POST = telemetryHandler(screenReport);
