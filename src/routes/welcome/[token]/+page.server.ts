import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { linkOutcome } from 'ui/emailedLink/outcome.ts';
import { passwordRefusal } from 'ui/emailedLink/password.ts';
import { platformClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { completeSession } from '#lib/server/auth-completion.ts';
import { requiredSecret } from '#lib/server/form.ts';
import type { SessionState, UserActivation } from '#generated/com-bryzek-platform.ts';

/**
 * Where the "Set your password" link in the welcome email lands: an invited user choosing their
 * first password.
 *
 * THE PATH IS NOT OURS TO CHOOSE. `UserActivationProcessor` builds the link as
 * `<tenant frontend>/welcome/<token>` for every tenant, so this route has to sit at exactly that
 * path. `src/routes/emailedLinkRoutes.test.ts` pins the whole set of paths mailed to this tenant.
 *
 * The token in the path is the whole proof — the platform authorizes both calls on the token
 * alone, and an invitee has no account to sign in to yet — so this route sends no session and is
 * public.
 *
 * THE GET DOES NOT SPEND THE TOKEN. Only `POST /activations/:token/password` consumes the
 * activation, so a link scanner following the URL renders the form and changes nothing. The token
 * stays out of the page payload: the action reads it from `params`.
 *
 * Which failure means the link is dead is `ui/emailedLink/outcome.ts`: only a 404, so an outage
 * never tells somebody holding a live invitation that it is dead.
 */
export const load: PageServerLoad = async ({ params, url }) => {
  const response = await handleApiCall<UserActivation>(() =>
    platformClient({ headers: getSessionHeaders() }).getUserActivationByToken(params.token)
  );

  const outcome = linkOutcome(response);

  return {
    outcome: outcome.kind === 'ready' ? { kind: outcome.kind, ...greeting(outcome.data) } : outcome,
    // The same URL, for the retry link on a transient failure, so it works with no JavaScript.
    retryUrl: url.pathname
  };
};

export const actions: Actions = {
  default: async ({ request, params, cookies }) => {
    const formData = await request.formData();
    const password = requiredSecret(formData, 'password') ?? '';
    const refusal = passwordRefusal(password, { confirmation: requiredSecret(formData, 'confirm_password') ?? '' });
    if (refusal) {
      return fail(400, { errors: [refusal] });
    }

    const response = await handleApiCall<SessionState>(() =>
      platformClient({ headers: getSessionHeaders() }).createUserActivationPasswordByToken({
        token: params.token,
        body: { password }
      })
    );

    // The activation was live when `load` read it and is not live now: it is single use and it
    // expires, so a double submit or an invitation that lapsed while the page was open lands here.
    // Say so as the page's own dead-link state rather than as an error against the password.
    if (isApiError(response) && response.status === 404) {
      return fail(404, { errors: [], linkInvalid: true });
    }

    return completeSession(cookies, response, '/', 'Welcome to API Builder');
  }
};

/**
 * Who the page greets: only the name and address, so the rest of the activation stays out of the
 * page payload. Both are optional on the wire, and each is omitted rather than set to `undefined`
 * because `exactOptionalPropertyTypes` distinguishes them.
 */
function greeting(activation: UserActivation): { name?: string; email?: string } {
  const { name, email } = activation;
  return {
    ...(name === undefined ? {} : { name: name }),
    ...(email === undefined ? {} : { email: email.address })
  };
}
