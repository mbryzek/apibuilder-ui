import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { GeneratorService } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const uri = formData.get('uri') as string;

		if (!uri) {
			return fail(400, { errors: [{ message: 'URI is required' }] });
		}

		const response = await handleApiCall<GeneratorService>(
			() => locals.apiClient.createGeneratorService({ body: { uri }, headers }),
		);

		if ('data' in response) {
			throw redirect(303, '/generators');
		}

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
