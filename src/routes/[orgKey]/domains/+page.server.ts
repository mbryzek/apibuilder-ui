import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuthLoad, adminClient } from '$lib/server/auth';
import { requiredString } from '$lib/server/form';
import type { Domain } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = requireAuthLoad;

export const actions: Actions = {
  addDomain: async ({ request, params, locals }) => {
    const { client } = await adminClient(locals, params.orgKey);
    const formData = await request.formData();
    const name = requiredString(formData, 'name');

    if (!name) {
      return fail(400, { errors: [{ message: 'Domain name is required' }] });
    }

    const response = await handleApiCall<Domain>(() => client.createDomain({ orgKey: params.orgKey, body: { name } }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  },

  removeDomain: async ({ request, params, locals }) => {
    const { client } = await adminClient(locals, params.orgKey);
    const formData = await request.formData();
    const name = requiredString(formData, 'name');

    if (!name) {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const response = await handleApiCall<void>(() => client.deleteDomainByName({ orgKey: params.orgKey, name }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  }
};
