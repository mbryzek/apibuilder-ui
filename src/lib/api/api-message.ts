/**
 * What a failed API call says to the person who caused it.
 *
 * `handleApiCall` reports a failure faithfully: the server's own message when the response
 * carried one, and otherwise the generated `statusMessage` table — accurate, but phrased for
 * every app that shares that table rather than for this one. This module is the one place that
 * decides which failures carry a message worth showing and what the rest say instead, so a page
 * load (`load-error.ts`) and a form submission (`action-error.ts`) cannot drift into describing
 * the same outage two different ways.
 */

import type { ApiError, ApiResponseError } from './error-handler';

export const UNAVAILABLE = 'We could not reach the server. Please try again in a moment.';
const GENERIC = 'We could not load this data. Please try again.';

/**
 * Statuses whose message was written for a human: our own network sentinel (0), and
 * the validation responses, where the server names the field and what is wrong with it.
 * Every other failure falls back to the shared `statusMessage` wording, which is correct
 * but says nothing this app's own sentence below does not say better.
 */
const MESSAGE_FROM_API = new Set([0, 400, 409, 422]);

const MESSAGE_BY_STATUS: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to view this.',
  404: 'We could not find this.',
  429: 'Too many requests. Please wait a moment and try again.'
};

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

/** The single sentence this failure is worth showing. */
export function messageFor({ status, errors }: ApiResponseError): string {
  if (MESSAGE_FROM_API.has(status)) {
    return firstMessage(errors) ?? UNAVAILABLE;
  }
  return MESSAGE_BY_STATUS[status] ?? (status >= 500 ? UNAVAILABLE : GENERIC);
}

/**
 * The errors a form should render.
 *
 * A validation response is already per-field prose the user needs in full, so it is passed
 * through whole — dropping all but the first would hide the second thing wrong with the form.
 * Anything else collapses to the one sentence `messageFor` chose, because the alternative is
 * showing the client's boilerplate verbatim.
 */
export function humanizedErrors(response: ApiResponseError): ApiError[] {
  const fromApi = MESSAGE_FROM_API.has(response.status) ? response.errors.filter(hasMessage) : [];
  return fromApi.length > 0 ? fromApi : [{ message: messageFor(response) }];
}

function firstMessage(errors: ApiError[]): string | undefined {
  return errors.find(hasMessage)?.message;
}

function hasMessage(error: ApiError): boolean {
  return error.message.trim().length > 0;
}
