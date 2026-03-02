import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getMemberships, getMembershipRequests, createMembershipRequest, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Membership, MembershipRequest } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const { params } = event;

	// Check if already a member
	const membershipsResponse = await handleApiCall<Membership[]>(
		() => getMemberships({ org_key: params.orgKey, user_guid: session.user.guid }, headers),
	);
	const isMember = 'data' in membershipsResponse && membershipsResponse.data.length > 0;

	// Check if already requested
	const requestsResponse = await handleApiCall<MembershipRequest[]>(
		() => getMembershipRequests(headers, { org_key: params.orgKey, user_guid: session.user.guid }),
	);
	const hasPendingRequest = 'data' in requestsResponse && requestsResponse.data.length > 0;

	return { isMember, hasPendingRequest };
};

export const actions: Actions = {
	default: async ({ locals, parent }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const { org } = await parent();

		const response = await handleApiCall<MembershipRequest>(
			() => createMembershipRequest(org.guid, session.user.guid, 'member', headers),
		);

		if ('data' in response) {
			return { success: true };
		}

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
