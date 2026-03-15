import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Attribute, AttributeForm } from '$generated/com-bryzek-bryzek-apibuilder-v0';

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

		const body: AttributeForm = { name };
		if (description) {
			body.description = description;
		}

		const response = await handleApiCall<Attribute>(
			() => apiBuilderClient().createAttribute({ body, headers }),
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
