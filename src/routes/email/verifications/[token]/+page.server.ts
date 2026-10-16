import type { PageServerLoad } from './$types';
import { platformClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, isApiSuccess } from '#lib/api/error-handler.ts';
import { messageFor } from '#lib/api/api-message.ts';

/**
 * Where the "Verify your email" link the platform mails lands.
 *
 * THE PATH IS NOT OURS TO CHOOSE. `EmailVerificationProcessor` builds the link as
 * `<tenant frontend>/email/verifications/<token>` for every tenant, so this route has to sit at
 * exactly that path — a route at any other spelling is a 404 for everyone who clicks the link,
 * and nothing in the platform can see that it happened. `src/routes/emailedLinkRoutes.test.ts`
 * pins the whole set of paths mailed to this tenant.
 *
 * THE OUTCOME IS RENDERED AT THE LINK, NOT REDIRECTED AWAY FROM IT. The recipient is normally
 * signed out and has nowhere else to read the answer: a redirect to `/` drops the token from the
 * URL, and the platform's `CheckEmailedLinkRoutesProcessor` reads a redirect that does not carry
 * the token as a dead end — indistinguishable, from outside, from an auth gate swallowing the
 * link. So every answer, including a token the platform does not hold, is a page served here.
 *
 * The token in the path is the whole proof, so this route is public and the call carries whatever
 * session happens to exist rather than requiring one.
 *
 * A link that did not verify anything has two quite different explanations, and only one of them
 * means the link is dead: `messageFor` says "we could not reach the server" for an outage, and
 * only a 404 — an answer from the platform saying it does not hold this token — means the token
 * itself is the problem. Telling somebody holding a good link that it is dead makes them stop
 * clicking the one route they have.
 */
const INVALID_TOKEN = 'That verification link is no longer valid. Please request a new one.';

type VerificationOutcome = { verified: true } | { verified: false; message: string };

export const load: PageServerLoad = async ({ params, locals }): Promise<VerificationOutcome> => {
  const headers = getSessionHeaders(locals.session?.id);

  const response = await handleApiCall<void>(() => platformClient({ headers }).updateEmailVerificationByToken(params.token));

  if (isApiSuccess(response)) {
    return { verified: true };
  }

  return { verified: false, message: response.status === 404 ? INVALID_TOKEN : messageFor(response) };
};
