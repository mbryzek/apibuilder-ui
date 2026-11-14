import { ctx } from '#lib/telemetry/context.ts';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { actionFail } from '#lib/api/action-error.ts';
import { requireAuthLoad, adminClient } from '#lib/server/auth.ts';
import { optionalString, requiredEnum, requiredString } from '#lib/server/form.ts';
import { redirectWithFlash } from '#lib/server/flash.ts';
import type { Organization, OrganizationForm } from '#generated/com-bryzek-apibuilder.ts';
import { OFFERED_VISIBILITIES } from '#lib/utils/visibility.ts';

export const load: PageServerLoad = requireAuthLoad;

export const actions: Actions = {
  update: async (event) => {
    const { request, params, locals, cookies } = event;
    const { client } = await adminClient(ctx(event, 'form'), locals, params.orgKey);
    const formData = await request.formData();

    const name = requiredString(formData, 'name');
    const namespace = requiredString(formData, 'namespace');
    const key = optionalString(formData, 'key');
    const visibility = requiredEnum(formData, 'visibility', OFFERED_VISIBILITIES);
    // Travels back with every refusal, so a refused edit keeps what was typed rather than
    // reverting to the saved organization.
    const values = { name: name ?? '', namespace: namespace ?? '', key: key ?? '', visibility };

    if (!name || !namespace) {
      return fail(400, { errors: [{ message: 'Name and namespace are required' }], ...values });
    }

    if (!visibility) {
      return fail(400, { errors: [{ message: 'Visibility is required' }], ...values });
    }

    const form: OrganizationForm = { name, namespace, visibility };
    if (key) form.key = key;

    const response = await handleApiCall<Organization>(() =>
      client.updateOrganizationByKey(ctx(event, 'form'), { key: params.orgKey, body: form })
    );

    if (isApiError(response)) {
      return actionFail(response, values);
    }

    redirectWithFlash(cookies, `/${response.data.key}/details`, 'Organization updated');
  },

  delete: async (event) => {
    const { params, locals, cookies } = event;
    const { client } = await adminClient(ctx(event, 'form'), locals, params.orgKey);

    const response = await handleApiCall<void>(() => client.deleteOrganizationByKey(ctx(event, 'form'), params.orgKey));

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(cookies, '/', 'Organization deleted');
  }
};
