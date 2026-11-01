import type { PageServerLoad } from './$types';
import { verificationOutcome } from 'ui/emailedLink/outcome.ts';
import { platformClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';

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
 * Which failure means the link is dead is `ui/emailedLink/outcome.ts`: only a 404.
 */
export const load: PageServerLoad = async ({ params, locals, url }) => {
  const headers = getSessionHeaders(locals.session?.id);

  return {
    outcome: verificationOutcome(await handleApiCall<void>(() => platformClient({ headers }).updateEmailVerificationByToken(params.token))),
    // The same URL, for the retry link on a transient failure, so it works with no JavaScript.
    retryUrl: url.pathname
  };
};
