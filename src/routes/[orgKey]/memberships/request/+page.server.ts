import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getMemberships, getMembershipRequests, createMembershipRequest, getOrganizationByKey, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Membership, MembershipRequest, Organization } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const { params } = event;

	// Check if already a member
	const membershipsResponse = await handleApiCall<Membership[]>(
		() => getMemberships({ org_key: params.orgKey, user_guid: session.user.id }, headers),
	);
	const isMember = 'data' in membershipsResponse && membershipsResponse.data.length > 0;

	// Check if already requested
	const requestsResponse = await handleApiCall<MembershipRequest[]>(
		() => getMembershipRequests(headers, { org_key: params.orgKey, user_guid: session.user.id }),
	);
	const hasPendingRequest = 'data' in requestsResponse && requestsResponse.data.length > 0;

	return { isMember, hasPendingRequest };
};

export const actions: Actions = {
	default: async ({ locals, params }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const orgResponse = await handleApiCall<Organization>(
			() => getOrganizationByKey(params.orgKey, headers),
		);
		if (!('data' in orgResponse)) {
			return fail(400, { errors: [{ message: 'Organization not found' }] });
		}

		const response = await handleApiCall<MembershipRequest>(
			() => createMembershipRequest(orgResponse.data.guid, session.user.id, 'member', headers),
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
