import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { requiredString } from '$lib/server/form';
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
    const name = requiredString(formData, 'name');

    if (!name) {
      return fail(400, { errors: [{ message: 'Domain name is required' }] });
    }

    const response = await handleApiCall<Domain>(() =>
      apiBuilderClient({ headers }).createDomain({ orgKey: params.orgKey, body: { name } })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  },

  removeDomain: async ({ request, params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const name = requiredString(formData, 'name');

    if (!name) {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const response = await handleApiCall<void>(() => apiBuilderClient({ headers }).deleteDomainByName({ orgKey: params.orgKey, name }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  }
};
