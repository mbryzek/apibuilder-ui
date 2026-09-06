import type { PageServerLoad } from './$types';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiSuccess } from '$lib/api/error-handler';
import { messageFor } from '$lib/api/api-message';
import { redirectWithFlash } from '$lib/server/flash';

/**
 * Where the "Verify your email" link the platform mails lands.
 *
 * THE PATH IS NOT OURS TO CHOOSE. `EmailVerificationProcessor` builds the link as
 * `<tenant frontend>/email/verifications/<token>` for every tenant, so this route has to sit at
 * exactly that path — a route at any other spelling is a 404 for everyone who clicks the link,
 * and nothing in the platform can see that it happened. `src/routes/emailedLinkRoutes.test.ts`
 * pins the whole set of paths mailed to this tenant.
 *
 * The token in the path is the whole proof and the recipient is normally signed out, so this
 * route is public and the call carries whatever session happens to exist rather than requiring one.
 *
 * A link that did not verify anything has two quite different explanations, and only one of them
 * means the link is dead: `messageFor` says "we could not reach the server" for an outage, and
 * only a 404 — an answer from the platform saying it does not hold this token — means the token
 * itself is the problem. Telling somebody holding a good link that it is dead makes them stop
 * clicking the one route they have.
 */
const INVALID_TOKEN = 'That verification link is no longer valid. Please request a new one.';

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
  const headers = getSessionHeaders(locals.session?.id);

  const response = await handleApiCall<void>(() => platformClient({ headers }).updateEmailVerificationByToken(params.token));

  if (isApiSuccess(response)) {
    redirectWithFlash(cookies, '/', 'Email verified');
  }

  redirectWithFlash(cookies, '/', response.status === 404 ? INVALID_TOKEN : messageFor(response), 'error');
};
