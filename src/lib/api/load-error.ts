/**
 * Load-time API failures
 *
 * A `load` function has no `fail()` — it can only throw an error page or return data.
 * The house pattern was `'data' in response ? response.data : []`, which turns a 401,
 * a 403, a 500 or a dropped connection into a page that renders "there is nothing
 * here". These helpers keep the failure attached to the data so a page can say what
 * actually happened instead of inventing a benign explanation for it.
 */

import { error } from '@sveltejs/kit';
import { isApiError, isApiSuccess, type ApiError, type ApiResponse, type ApiResponseError } from './error-handler';

/** Why a page's data could not be loaded, phrased for the person reading the page. */
export interface LoadError {
  status: number;
  message: string;
}

const UNAVAILABLE = 'We could not reach the server. Please try again in a moment.';
const GENERIC = 'We could not load this data. Please try again.';

/**
 * Statuses whose message was written for a human: our own network sentinel (0), and
 * the validation responses. Every other failure arrives as `HTTP 500: Request failed
 * with status 500` from the generated client, which is not something to show anyone.
 */
const MESSAGE_FROM_API = new Set([0, 400, 409, 422]);

const MESSAGE_BY_STATUS: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to view this.',
  404: 'We could not find this.',
  429: 'Too many requests. Please wait a moment and try again.'
};

/** The data from a successful call, or `fallback` when the call failed. */
export function dataOr<T>(response: ApiResponse<T>, fallback: T): T {
  return isApiSuccess(response) ? response.data : fallback;
}

/**
 * Abandon the request when the API never gave an answer. A 401, 403 or 404 *is* an
 * answer and the caller decides what it means; a dropped connection, a rate limit or a
 * 5xx is not, and reporting one of those as "not found" or "forbidden" tells the user
 * something untrue about their access.
 */
export function throwIfUnavailable(response: ApiResponse<unknown>): void {
  if (!isApiError(response) || !isUnavailable(response.status)) {
    return;
  }
  const { status, message } = toLoadError(response);
  throw error(isHttpErrorStatus(status) ? status : 503, message);
}

/**
 * The data from a successful call, or an error page. For a route that exists to show
 * one record there is nothing to degrade to, so an outage gets its own status and
 * message rather than being dressed up as a record that does not exist.
 */
export function dataOrThrow<T>(response: ApiResponse<T>, missingMessage: string): T {
  if (isApiSuccess(response)) {
    return response.data;
  }
  throwIfUnavailable(response);
  // A 401/403/404 is the API declining to show this record. Keep them indistinguishable
  // so a private record cannot be confirmed to exist by the status it returns.
  throw error(404, missingMessage);
}

/**
 * The first failure among the calls a loader made, or null when they all succeeded.
 * A page shows one banner, so the first failure is the one it reports.
 */
export function loadErrorFrom(...responses: (ApiResponse<unknown> | null | undefined)[]): LoadError | null {
  for (const response of responses) {
    if (response && isApiError(response)) {
      return toLoadError(response);
    }
  }
  return null;
}

function toLoadError(response: ApiResponseError): LoadError {
  return { status: response.status, message: messageFor(response) };
}

function messageFor({ status, errors }: ApiResponseError): string {
  if (MESSAGE_FROM_API.has(status)) {
    return firstMessage(errors) ?? UNAVAILABLE;
  }
  return MESSAGE_BY_STATUS[status] ?? (status >= 500 ? UNAVAILABLE : GENERIC);
}

function firstMessage(errors: ApiError[]): string | undefined {
  return errors.find((e) => e.message.trim().length > 0)?.message;
}

function isHttpErrorStatus(status: number): boolean {
  return status >= 400 && status <= 599;
}

/**
 * The API gave no answer: our network sentinel (0), a rate limit, or a 5xx.
 *
 * Exported because `hooks.server.ts` needs the same test but cannot use `throwIfUnavailable` — an
 * error thrown from `handle` would take down every public page, not just the ones that need a
 * session.
 */
export function isUnavailable(status: number): boolean {
  return status === 0 || status === 429 || status >= 500;
}
