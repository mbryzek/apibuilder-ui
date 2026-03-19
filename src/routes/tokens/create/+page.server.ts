import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Token, TokenForm } from '$generated/com-bryzek-apibuilder-v0';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const description = formData.get('description') as string;

		const body: TokenForm = { user_id: session.user.id };
		if (description) {
			body.description = description;
		}

		const response = await handleApiCall<Token>(
			() => apiBuilderClient().createToken({ body, headers }),
		);

		if ('data' in response) {
			throw redirect(303, `/tokens/${response.data.id}`);
		}

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
