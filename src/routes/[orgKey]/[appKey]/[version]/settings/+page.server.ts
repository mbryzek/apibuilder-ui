import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { requiredEnum, requiredString } from '$lib/server/form';
import { redirectWithFlash } from '$lib/server/flash';
import type { Application } from '$generated/com-bryzek-apibuilder';
import { Visibility } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  requireAuth(event);
  return {};
};

export const actions: Actions = {
  updateVisibility: async ({ request, params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const client = apiBuilderClient();

    const visibility = requiredEnum(formData, 'visibility', Object.values(Visibility));
    if (!visibility) {
      return fail(400, { errors: [{ message: 'Visibility is required' }] });
    }

    const name = requiredString(formData, 'name');
    if (!name) {
      return fail(400, { errors: [{ message: 'Name is required' }] });
    }

    const response = await handleApiCall<Application>(() =>
      client.updateApplicationByAppKey({
        orgKey: params.orgKey,
        appKey: params.appKey,
        body: { name, visibility },
        headers
      })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(`/${params.orgKey}/${response.data.key}/${params.version}/settings`, 'Visibility updated');
  },

  deleteApp: async ({ params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const client = apiBuilderClient();

    const response = await handleApiCall<void>(() =>
      client.deleteApplicationByAppKey({ orgKey: params.orgKey, appKey: params.appKey, headers })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(`/${params.orgKey}`, 'Application deleted');
  }
};
