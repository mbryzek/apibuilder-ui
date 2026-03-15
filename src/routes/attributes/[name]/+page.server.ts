import type { PageServerLoad, Actions } from './$types';
import { redirect, fail, error } from '@sveltejs/kit';
import { getAttributes, deleteAttribute } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuthForAction } from '$lib/server/auth';
import type { ApiAttribute } from '$generated/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<ApiAttribute[]>(
		() => getAttributes(headers, { name: params.name }),
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
			() => deleteAttribute(params.name, headers),
		);

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		throw redirect(303, '/attributes');
	},
};
