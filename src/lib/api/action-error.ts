/**
 * Form-action API failures
 *
 * An action's only way to say "that did not work" is `fail(status, data)`, and the house pattern
 * was `fail(400, { errors: response.errors })` — which hands the generated client's
 * `HTTP 500: Request failed with status 500` straight to a page rendering `{err.message}`, and
 * records a platform outage in the logs as a client mistake. These helpers put the action path on
 * the same wording (`api-message.ts`) the load path has always used, and on a status that matches
 * what actually happened.
 */

import { fail, type ActionFailure } from '@sveltejs/kit';
import { isApiError, type ApiError, type ApiResponse, type ApiResponseError } from './error-handler';
import { humanizedErrors, isUnavailable } from './api-message';

/**
 * The status to fail with.
 *
 * `Math.max(status, 400)` was the better half of the two patterns in the tree, but it turns
 * `handleApiCall`'s network sentinel (0) into a 400 — filing "the server never answered" under
 * client error. Anything outside the range an HTTP failure can occupy is an outage when
 * `isUnavailable` says so and a rejected submission otherwise.
 */
function failStatus(status: number): number {
  if (status >= 400 && status <= 599) {
    return status;
  }
  return isUnavailable(status) ? 503 : 400;
}

/**
 * Refuse the submission, saying what went wrong in words written for the person who submitted it.
 *
 * `extra` is for the fields a page re-renders its form from (`signup` keeps the email and name,
 * `upload` the app key), which reach the page only if they travel with the failure.
 */
export function actionFail<T extends Record<string, unknown>>(
  response: ApiResponseError,
  extra?: T
): ActionFailure<{ errors: ApiError[] } & T> {
  return fail(failStatus(response.status), { errors: humanizedErrors(response), ...extra } as { errors: ApiError[] } & T);
}

/**
 * Refuse the submission because the record an action needs is not there, without claiming it is
 * absent when the truth is that nothing answered. The action-path counterpart of `dataOrThrow`.
 *
 * An empty result, a 401, a 403 or a 404 *is* an answer, and `missingMessage` is the caller
 * naming the record ("Organization not found") better than this module can. A dropped connection
 * or a 5xx is not an answer, and reporting one as a missing organization sends an admin off to
 * check a spelling while the platform is down.
 */
export function actionFailMissing(response: ApiResponse<unknown>, missingMessage: string): ActionFailure<{ errors: ApiError[] }> {
  if (isApiError(response) && isUnavailable(response.status)) {
    return actionFail(response);
  }
  return fail(failStatus(response.status), { errors: [{ message: missingMessage }] });
}
