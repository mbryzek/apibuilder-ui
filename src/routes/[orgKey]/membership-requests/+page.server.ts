import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getMembershipRequests, acceptMembershipRequest, declineMembershipRequest, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { MembershipRequest, Membership } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);

	const response = await handleApiCall<MembershipRequest[]>(
		() => getMembershipRequests(headers, { org_key: event.params.orgKey }),
	);

	return {
		requests: 'data' in response ? response.data : [],
	};
};

export const actions: Actions = {
	accept: async ({ request, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const guid = formData.get('guid') as string;

		const response = await handleApiCall<Membership>(
			() => acceptMembershipRequest(guid, headers),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},

	decline: async ({ request, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const guid = formData.get('guid') as string;

		const response = await handleApiCall<void>(
			() => declineMembershipRequest(guid, headers),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},
};
