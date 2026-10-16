import { isApiError, type ApiResponse } from '#lib/api/error-handler.ts';
import type { UserActivation } from '#generated/com-bryzek-platform.ts';

/**
 * What the welcome page knows about the invitation before the invitee has typed anything.
 *
 * `invalid` and `unavailable` are deliberately separate. The platform answers 404 for a token it
 * does not hold and nothing else — unknown, spent and expired are one indistinguishable status by
 * design, so the endpoint cannot be walked to learn whether an account exists — so every other
 * failure is ours and is transient. Folding the two together tells somebody holding a live
 * invitation that it is dead, and the token is their whole credential.
 */
export type ActivationOutcome = { kind: 'ready'; name?: string; email?: string } | { kind: 'invalid' } | { kind: 'unavailable' };

/**
 * `name` and `email` are both optional on the wire — a person record may carry neither — so the
 * page greets whoever it can identify. Each is omitted rather than set to `undefined` because
 * `exactOptionalPropertyTypes` distinguishes them.
 */
export function activationOutcome(response: ApiResponse<UserActivation>): ActivationOutcome {
  if (isApiError(response)) {
    return response.status === 404 ? { kind: 'invalid' } : { kind: 'unavailable' };
  }

  const { name, email } = response.data;
  return {
    kind: 'ready',
    ...(name === undefined ? {} : { name: name }),
    ...(email === undefined ? {} : { email: email.address })
  };
}
