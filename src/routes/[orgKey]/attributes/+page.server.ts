import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getOrgAttributes, putOrgAttribute, deleteOrgAttribute, getAttributes, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { AttributeValue, ApiAttribute } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);

	const [orgAttrsResponse, allAttrsResponse] = await Promise.all([
		handleApiCall<AttributeValue[]>(
			() => getOrgAttributes(event.params.orgKey, headers),
		),
		handleApiCall<ApiAttribute[]>(
			() => getAttributes(headers, { limit: 100 }),
		),
	]);

	return {
		orgAttributes: 'data' in orgAttrsResponse ? orgAttrsResponse.data : [],
		allAttributes: 'data' in allAttrsResponse ? allAttrsResponse.data : [],
	};
};

export const actions: Actions = {
	setAttribute: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const value = formData.get('value') as string;

		if (!name || !value) {
			return fail(400, { errors: [{ message: 'Attribute name and value are required' }] });
		}

		const response = await handleApiCall<AttributeValue>(
			() => putOrgAttribute(params.orgKey, name, { value }, headers),
		);

		if ('data' in response) {
			return { success: true };
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},

	removeAttribute: async ({ request, params, locals }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, { errors: [{ message: 'Invalid request' }] });
		}

		const response = await handleApiCall<void>(
			() => deleteOrgAttribute(params.orgKey, name, headers),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},
};
