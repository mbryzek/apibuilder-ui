/**
 * API error handling — the parts that are this app's alone.
 *
 * The response envelope (`ApiResponse`/`ApiError`), the status→message table and the
 * decoding of whatever a generated client throws all live in `$generated/generated-util`,
 * emitted by the apibuilder TypeScript generator into every repo that consumes these
 * APIs. This module re-exports them from the module path the call sites already import
 * from, and adds the one name that is local to this app.
 *
 * Nothing about a failure is phrased for a user here: `api-message.ts` owns that, and it
 * is the only thing that should read `status` to decide what a person is told.
 */

import type { ApiError } from '$generated/generated-util';

export { handleApiCall, isApiError, isApiSuccess, statusMessage } from '$generated/generated-util';
export type { ApiCallOptions, ApiError, ApiResponse, ApiResponseError, ApiResponseSuccess } from '$generated/generated-util';

/**
 * The form-error item type, under the name the `.svelte` files already import. Every
 * `form: { errors?: ApiErrorItem[] }` prop in this repo names it, so it stays as an
 * alias rather than becoming a rename across thirteen components.
 */
export type ApiErrorItem = ApiError;
