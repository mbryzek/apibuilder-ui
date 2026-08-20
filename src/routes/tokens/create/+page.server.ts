import type { PageServerLoad, Actions } from './$types';
import { getSessionHeaders, platformClient } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuthLoad, requireAuthForAction } from '$lib/server/auth';
import { optionalString } from '$lib/server/form';
import type { CreatedToken, TokenForm } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = requireAuthLoad;

export const actions: Actions = {
  /**
   * Mints the token and hands its value straight back to the page.
   *
   * NO REDIRECT, deliberately. The platform stores only a digest of the token, so this response is
   * the one and only time the value exists — redirecting anywhere would discard it, and there is no
   * endpoint that could fetch it back afterwards.
   */
  default: async ({ request, locals }) => {
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const description = optionalString(formData, 'description');

    const body: TokenForm = { user_id: session.user.id };
    if (description) {
      body.description = description;
    }

    const response = await handleApiCall<CreatedToken>(() => platformClient({ headers }).createToken({ body }));

    // The description travels back with the failure so a refused submission keeps what was typed:
    // `load` re-runs after an action and would otherwise re-render an empty field.
    if (isApiError(response)) {
      return actionFail(response, { description: description ?? '' });
    }

    return { created: response.data };
  }
};
