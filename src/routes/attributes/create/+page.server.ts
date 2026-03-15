import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createAttribute } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { ApiAttribute } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name) {
			return fail(400, { errors: [{ message: 'Name is required' }] });
		}

		const form: { name: string; description?: string } = { name };
		if (description) {
			form.description = description;
		}

		const response = await handleApiCall<ApiAttribute>(
			() => createAttribute(form, headers),
		);

		if ('data' in response) {
			throw redirect(303, '/attributes');
		}

		if ('errors' in response) {
			return fail(Math.max(response.status, 400), { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
