import type { PageServerLoad, Actions } from './$types';
import { redirect, fail, error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuthForAction } from '$lib/server/auth';
import type { Attribute } from '$generated/com-bryzek-bryzek-apibuilder-v0';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<Attribute[]>(
		() => apiBuilderClient().getAttributes({ name: params.name, limit: 1, offset: 0, headers }),
	);

	if (!('data' in response) || response.data.length === 0) {
		throw error(404, 'Attribute not found');
	}

	return {
		attribute: response.data[0],
	};
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<void>(
			() => apiBuilderClient().deleteAttributeByName(params.name, { headers }),
		);

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		throw redirect(303, '/attributes');
	},
};
