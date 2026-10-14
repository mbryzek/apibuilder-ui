import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { actionFail } from '#lib/api/action-error.ts';
import { requireAuthLoad } from '#lib/server/auth.ts';
import { optionalString, requiredEnum, requiredString } from '#lib/server/form.ts';
import { redirectWithFlash } from '#lib/server/flash.ts';
import type { Organization, OrganizationForm } from '#generated/com-bryzek-apibuilder.ts';
import { Visibility } from '#generated/com-bryzek-apibuilder.ts';

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
