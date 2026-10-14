import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.js';
import { handleApiCall, isApiError } from '#lib/api/error-handler.js';
import { actionFail } from '#lib/api/action-error.js';
import { requireAuthLoad } from '#lib/server/auth.js';
import { optionalString, requiredEnum, requiredString } from '#lib/server/form.js';
import { redirectWithFlash } from '#lib/server/flash.js';
import type { Organization, OrganizationForm } from '$generated/com-bryzek-apibuilder';
import { Visibility } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = requireAuthLoad;

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
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
    const response = await handleApiCall<Organization>(() => apiBuilderClient({ headers }).createOrganization({ body }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(cookies, '/' + response.data.key, 'Organization created successfully');
  }
};
