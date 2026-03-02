import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Membership, MembershipRequest, Organization } from '$generated/types';
import { MembershipRole } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const { params, locals } = event;

	// Check if already a member
	const membershipsResponse = await handleApiCall<Membership[]>(
		() => locals.apiClient.getMemberships({ orgKey: params.orgKey, userGuid: session.user.guid, limit: 100, offset: 0, headers }),
	);
	const isMember = 'data' in membershipsResponse && membershipsResponse.data.length > 0;

	// Check if already requested
	const requestsResponse = await handleApiCall<MembershipRequest[]>(
		() => locals.apiClient.getMembershipRequests({ orgKey: params.orgKey, userGuid: session.user.guid, limit: 100, offset: 0, headers }),
	);
	const hasPendingRequest = 'data' in requestsResponse && requestsResponse.data.length > 0;

	return { isMember, hasPendingRequest };
};

export const actions: Actions = {
	default: async ({ locals, params }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const orgResponse = await handleApiCall<Organization>(
			() => locals.apiClient.getOrganizationByKey(params.orgKey, { headers }),
		);
		if (!('data' in orgResponse)) {
			return fail(400, { errors: [{ message: 'Organization not found' }] });
		}

		const response = await handleApiCall<MembershipRequest>(
			() => locals.apiClient.createMembershipRequest({ orgGuid: orgResponse.data.guid, userGuid: session.user.guid, role: MembershipRole.Member, headers }),
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
