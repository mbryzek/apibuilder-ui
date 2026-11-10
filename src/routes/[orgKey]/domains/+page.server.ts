import { ctx } from '#lib/telemetry/context.ts';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { actionFail } from '#lib/api/action-error.ts';
import { requireAuthLoad, adminClient } from '#lib/server/auth.ts';
import { requiredString } from '#lib/server/form.ts';
import type { Domain } from '#generated/com-bryzek-apibuilder.ts';

export const load: PageServerLoad = requireAuthLoad;

export const actions: Actions = {
  addDomain: async (event) => {
    const { request, params, locals } = event;
    const { client } = await adminClient(ctx(event, 'form'), locals, params.orgKey);
    const formData = await request.formData();
    const name = requiredString(formData, 'name');

    if (!name) {
      return fail(400, { errors: [{ message: 'Domain name is required' }] });
    }

    const response = await handleApiCall<Domain>(() => client.createDomain(ctx(event, 'form'), { orgKey: params.orgKey, body: { name } }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  },

  removeDomain: async (event) => {
    const { request, params, locals } = event;
    const { client } = await adminClient(ctx(event, 'form'), locals, params.orgKey);
    const formData = await request.formData();
    const name = requiredString(formData, 'name');

    if (!name) {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const response = await handleApiCall<void>(() => client.deleteDomainByName(ctx(event, 'form'), { orgKey: params.orgKey, name }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  }
};
