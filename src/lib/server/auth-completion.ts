import { fail, type ActionFailure, type Cookies } from '@sveltejs/kit';
import { isTenantSession, isUserInactive, type SessionState } from '$generated/com-bryzek-platform';
import { isApiError, type ApiError, type ApiResponse } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { redirectWithFlash } from './flash';
import { setSessionCookie } from './session';

/**
 * Finish an authentication round-trip.
 *
 * `SessionState` is a two-variant union: a login can succeed with HTTP 200 and still not produce a
 * session, because the account is deactivated (`user_inactive`). Handling only `tenant_session` and
 * falling through to a generic 500 tells the user the server broke when in fact their account is
 * disabled — an actionable state that is not an error at all. Both known variants are enumerated
 * here so a new one becomes a compile-visible gap rather than a silent 500.
 *
 * On success this throws a redirect and never returns.
 */
export function completeSession(
  cookies: Cookies,
  response: ApiResponse<SessionState>,
  redirectTo: string,
  successMessage: string
): ActionFailure<{ errors: ApiError[] }> {
  if (isApiError(response)) {
    return actionFail(response);
  }

  // `handleApiCall` yields `data: undefined` for a 2xx with no body, so guard before narrowing
  // rather than letting the type guard dereference nothing.
  if (!response.data) {
    return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
  }

  if (isTenantSession(response.data)) {
    setSessionCookie(cookies, response.data.session.id);
    redirectWithFlash(redirectTo, successMessage);
  }

  if (isUserInactive(response.data)) {
    return fail(403, { errors: [{ message: 'This account is not active. Please contact support.' }] });
  }

  return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
}
