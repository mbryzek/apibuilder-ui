import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Token, TokenForm } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async (event) => {
  requireAuth(event);
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const description = formData.get('description') as string;

    const body: TokenForm = { user_id: session.user.id };
    if (description) {
      body.description = description;
    }

    const response = await handleApiCall<Token>(() => platformClient().createToken({ body, headers }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    throw redirect(303, `/tokens/${response.data.id}`);
  }
};
