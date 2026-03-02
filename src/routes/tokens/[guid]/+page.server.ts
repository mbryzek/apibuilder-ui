import type { PageServerLoad, Actions } from './$types';
import { redirect, fail, error } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { CleartextToken } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);

	const response = await handleApiCall<CleartextToken>(
		() => event.locals.apiClient.getTokenCleartextByGuid(event.params.guid, { headers }),
	);

	if (!('data' in response)) {
		throw error(response.status === 404 ? 404 : 500, 'Token not found');
	}

	return {
		tokenGuid: event.params.guid,
		cleartextToken: response.data.token,
	};
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<void>(
			() => locals.apiClient.deleteTokenByGuid(params.guid, { headers }),
		);

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		throw redirect(303, '/tokens');
	},
};
