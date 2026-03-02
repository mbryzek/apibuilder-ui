import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { MembershipRequest } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const { isAdmin } = await event.parent();
	if (!isAdmin) {
		throw error(403, 'Forbidden');
	}
	const headers = getSessionHeaders(session.id);

	const response = await handleApiCall<MembershipRequest[]>(
		() => event.locals.apiClient.getMembershipRequests({ orgKey: event.params.orgKey, limit: 100, offset: 0, headers }),
	);

	return {
		requests: 'data' in response ? response.data : [],
	};
};

export const actions: Actions = {
	accept: async ({ request, locals, params }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const guid = formData.get('guid');

		if (!guid || typeof guid !== 'string') {
			return fail(400, { errors: [{ message: 'Invalid request' }] });
		}

		const response = await handleApiCall<void>(
			() => locals.apiClient.createMembershipRequestAcceptByGuid(guid, { headers }),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},

	decline: async ({ request, locals, params }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const guid = formData.get('guid');

		if (!guid || typeof guid !== 'string') {
			return fail(400, { errors: [{ message: 'Invalid request' }] });
		}

		const response = await handleApiCall<void>(
			() => locals.apiClient.createMembershipRequestDeclineByGuid(guid, { headers }),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},
};
