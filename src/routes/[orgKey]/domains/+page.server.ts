import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { Domain } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  requireAuth(event);
  return {};
};

export const actions: Actions = {
  addDomain: async ({ request, params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const name = (formData.get('name') as string)?.trim();

    if (!name) {
      return fail(400, { errors: [{ message: 'Domain name is required' }] });
    }

    const response = await handleApiCall<Domain>(() => apiBuilderClient().createDomain({ orgKey: params.orgKey, body: { name }, headers }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  },

  removeDomain: async ({ request, params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const name = formData.get('name');

    if (!name || typeof name !== 'string') {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const response = await handleApiCall<void>(() => apiBuilderClient().deleteDomainByName({ orgKey: params.orgKey, name, headers }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  }
};
