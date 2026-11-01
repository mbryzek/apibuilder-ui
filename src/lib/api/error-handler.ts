/**
 * API error handling — the parts that are this app's alone.
 *
 * The response envelope (`ApiResponse`/`ApiError`), the status→message table and the
 * decoding of whatever a generated client throws all live in `#generated/generated-util.ts`,
 * emitted by the apibuilder TypeScript generator into every repo that consumes these
 * APIs. This module re-exports them from the module path the call sites already import
 * from, reports every failed call to PostHog, and adds the one name that is local to this app.
 *
 * Which failure becomes which `api_*` event is `ui/telemetry/api-events.ts`, shared by every
 * app. Every API call this app makes runs on the server (a `+page.server.ts`, a `+server.ts`,
 * `hooks.server.ts`; see `src/csp.ts`), so the events go through the reporter `hooks.server.ts`
 * installs and the browser has no PostHog client to hand them to.
 *
 * Nothing about a failure is phrased for a user here: `api-message.ts` owns that, and it
 * is the only thing that should read `status` to decide what a person is told.
 */

import { browser } from '$app/env';
import { createApiEvents } from 'ui/telemetry/api-events.ts';
import { createScrubber } from 'ui/telemetry/scrub-endpoint.ts';
import { handleApiCall as generatedHandleApiCall, type ApiError } from '#generated/generated-util.ts';

export { isApiError, isApiSuccess, statusMessage } from '#generated/generated-util.ts';
export type { ApiCallOptions, ApiError, ApiResponse, ApiResponseError, ApiResponseSuccess } from '#generated/generated-util.ts';

/**
 * The form-error item type, under the name the `.svelte` files already import. Every
 * `form: { errors?: ApiErrorItem[] }` prop in this repo names it, so it stays as an
 * alias rather than becoming a rename across thirteen components.
 */
export type ApiErrorItem = ApiError;

/**
 * This app's token route the shared list does not cover: the password-reset page an apibuilder
 * reset mail links to. The API reads that token from the request body, never its path.
 */
export const scrubEndpoint = createScrubber([/(\/login\/reset-password\/)[^/?#]+/g]);

/** Says so if a browser-side call ever fails: nothing here reports one until a browser client is added. */
function browserHasNoPostHog(event: string): void {
  console.warn('[api-events] a browser-side API call failed and apibuilder-ui has no browser PostHog client', { event });
}

const apiEvents = createApiEvents({
  decode: generatedHandleApiCall,
  isBrowser: () => browser,
  trackEvent: browserHasNoPostHog,
  scrub: scrubEndpoint,
  warn: (message, context) => console.warn(message, context)
});

export const handleApiCall = apiEvents.handleApiCall;
export const reportApiEventsFromServer = apiEvents.reportFromServer;
