import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { optionalString, requiredEnum, requiredString } from '$lib/server/form';
import { redirectWithFlash } from '$lib/server/flash';
import type { Organization, OrganizationForm } from '$generated/com-bryzek-apibuilder';
import { Visibility } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  requireAuth(event);
  return {};
};

export const actions: Actions = {
  update: async ({ request, params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();

    const name = requiredString(formData, 'name');
    const namespace = requiredString(formData, 'namespace');
    const key = optionalString(formData, 'key');
    const visibility = requiredEnum(formData, 'visibility', Object.values(Visibility));

    if (!name || !namespace) {
      return fail(400, { errors: [{ message: 'Name and namespace are required' }] });
    }

    if (!visibility) {
      return fail(400, { errors: [{ message: 'Visibility is required' }] });
    }

    const form: OrganizationForm = { name, namespace, visibility };
    if (key) form.key = key;

    const response = await handleApiCall<Organization>(() =>
      apiBuilderClient({ headers }).updateOrganizationByKey({ key: params.orgKey, body: form })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(`/${response.data.key}/details`, 'Organization updated');
  },

  delete: async ({ params, locals }) => {
    await requireAdminForAction(locals, params.orgKey);
    const session = locals.session!;
    const headers = getSessionHeaders(session.id);

    const response = await handleApiCall<void>(() => apiBuilderClient({ headers }).deleteOrganizationByKey(params.orgKey));

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash('/', 'Organization deleted');
  }
};
