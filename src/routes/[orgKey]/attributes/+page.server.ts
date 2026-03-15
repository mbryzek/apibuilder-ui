import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { AttributeValue, Attribute } from '$generated/com-bryzek-bryzek-apibuilder-v0';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);

	const [orgAttrsResponse, allAttrsResponse] = await Promise.all([
		handleApiCall<AttributeValue[]>(
			() => apiBuilderClient().getAttributeValues({ orgKey: event.params.orgKey, limit: 100, offset: 0, headers }),
		),
		handleApiCall<Attribute[]>(
			() => apiBuilderClient().getAttributes({ limit: 100, offset: 0, headers }),
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
			() => apiBuilderClient().updateAttributeValueByName({ orgKey: params.orgKey, name, body: { value }, headers }),
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
			() => apiBuilderClient().deleteAttributeValueByName({ orgKey: params.orgKey, name, headers }),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},
};
