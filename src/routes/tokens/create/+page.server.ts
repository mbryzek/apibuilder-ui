import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Token } from '$generated/types';

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

		const form: { user_guid: string; description?: string } = { user_guid: session.user.guid };
		if (description) {
			form.description = description;
		}

		const response = await handleApiCall<Token>(
			() => locals.apiClient.createToken({ body: form, headers }),
		);

		if ('data' in response) {
			throw redirect(303, '/tokens');
		}

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
