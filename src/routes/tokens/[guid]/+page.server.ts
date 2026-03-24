import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { CleartextToken } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);

	const response = await handleApiCall<CleartextToken>(
		() => apiBuilderClient().getTokenCleartextById(event.params.guid, { headers }),
	);

	return {
		tokenGuid: event.params.guid,
		cleartextToken: 'data' in response ? response.data.token : null,
	};
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const response = await handleApiCall<void>(
			() => apiBuilderClient().deleteTokenById(params.guid, { headers }),
		);

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		throw redirect(303, '/tokens');
	},
};
