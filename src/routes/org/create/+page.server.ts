import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth } from '$lib/server/auth';
import { optionalString, requiredEnum, requiredString } from '$lib/server/form';
import { redirectWithFlash } from '$lib/server/flash';
import type { Organization, OrganizationForm } from '$generated/com-bryzek-apibuilder';
import { Visibility } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  requireAuth(event);
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.session) {
      throw redirect(302, '/login');
    }

    const formData = await request.formData();
    const name = requiredString(formData, 'name');
    const namespace = requiredString(formData, 'namespace');
    const key = optionalString(formData, 'key');
    const visibility = requiredEnum(formData, 'visibility', Object.values(Visibility)) ?? Visibility.Organization;

    if (!name || !namespace) {
      return fail(400, { errors: [{ message: 'Name and namespace are required' }] });
    }

    const body: OrganizationForm = { name, namespace, visibility };
    if (key) {
      body.key = key;
    }

    const headers = getSessionHeaders(locals.session.id);
    const response = await handleApiCall<Organization>(() => apiBuilderClient().createOrganization({ body, headers }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash('/' + response.data.key, 'Organization created successfully');
  }
};
