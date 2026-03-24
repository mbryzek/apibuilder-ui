import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Membership, MembershipRequest, Organization } from '$generated/com-bryzek-apibuilder';
import { MembershipRole } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const { params } = event;

	// Check if already a member
	const membershipsResponse = await handleApiCall<Membership[]>(
		() => apiBuilderClient().getMemberships({ orgKey: params.orgKey, userId: session.user.id, limit: 25, offset: 0, headers }),
	);
	const isMember = 'data' in membershipsResponse && membershipsResponse.data.length > 0;

	// Check if already requested
	const requestsResponse = await handleApiCall<MembershipRequest[]>(
		() => apiBuilderClient().getMembershipRequests({ orgKey: params.orgKey, userId: session.user.id, limit: 25, offset: 0, headers }),
	);
	const hasPendingRequest = 'data' in requestsResponse && requestsResponse.data.length > 0;

	return { isMember, hasPendingRequest };
};

export const actions: Actions = {
	default: async ({ locals, params }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);

		const orgResponse = await handleApiCall<Organization>(
			() => apiBuilderClient().getOrganizationByKey(params.orgKey, { headers }),
		);
		if (!('data' in orgResponse)) {
			return fail(400, { errors: [{ message: 'Organization not found' }] });
		}

		const response = await handleApiCall<MembershipRequest>(
			() => apiBuilderClient().createMembershipRequest({ body: { org_id: orgResponse.data.id, user_id: session.user.id, role: MembershipRole.Member }, headers }),
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
