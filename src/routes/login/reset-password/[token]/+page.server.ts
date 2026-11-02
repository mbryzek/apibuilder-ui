import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { emailedLinkFailure, linkOutcome } from 'ui/emailedLink/outcome.ts';
import { passwordRefusal } from 'ui/emailedLink/password.ts';
import { platformClient } from '#lib/api/clients.ts';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { config } from '#lib/config.ts';
import { completeSession } from '#lib/server/auth-completion.ts';
import { requiredSecret } from '#lib/server/form.ts';
import type { SessionState } from '#generated/com-bryzek-platform.ts';

/**
 * THE LINK IS READ, NOT SPENT, ON GET. `GET .../session/password/resets/:id` only says whether the
 * platform still holds the id, so a link scanner following the URL changes nothing and somebody
 * holding a dead link hears so before typing a password. Only the form post consumes the link.
 *
 * Which failure means the link is dead is `ui/emailedLink/outcome.ts`: only a 404, so an outage
 * never tells somebody holding a live link that it is dead.
 */
function readResetLink(id: string) {
  return handleApiCall(() => platformClient().getTenantSessionPasswordAndResetsById({ tenantId: config.tenantId, id }));
}

export const load: PageServerLoad = async ({ params, url }) => {
  return {
    outcome: linkOutcome(await readResetLink(params.token)),
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
      platformClient().createTenantSessionPasswordAndChanges({
        tenantId: config.tenantId,
        body: { id: params.token, password }
      })
    );

    // The link was live when `load` read it and can be dead now: it is single use and it expires.
    // The platform answers a dead id here with a 422 like any other refusal, so the read says which
    // this is, and the page shows it as a dead link rather than as a password that was rejected.
    if (
      isApiError(response) &&
      (emailedLinkFailure(response.status) === 'invalid' ||
        (response.status === 422 && linkOutcome(await readResetLink(params.token)).kind === 'invalid'))
    ) {
      return fail(404, { errors: [], linkInvalid: true });
    }

    return completeSession(cookies, response, '/', 'Password reset successfully!');
  }
};
