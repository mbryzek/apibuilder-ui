import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createDomain, deleteDomain } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { Domain } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	requireAuth(event);
	return {};
};

export const actions: Actions = {
	addDomain: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();

		if (!name) {
			return fail(400, { errors: [{ message: 'Domain name is required' }] });
		}

		const response = await handleApiCall<Domain>(
			() => createDomain(params.orgKey, { name }, headers),
		);

		if ('data' in response) {
			return { success: true };
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},

	removeDomain: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, { errors: [{ message: 'Invalid request' }] });
		}

		const response = await handleApiCall<void>(
			() => deleteDomain(params.orgKey, name, headers),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},
};
