import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	getMemberships, deleteMembership, getUsers,
	createMembershipRequest, acceptMembershipRequest,
	getMembershipRequests, getSessionHeaders,
	getOrganizationByKey,
} from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Membership, User, MembershipRequest, Organization } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const { params, parent } = event;
	const { isAdmin } = await parent();

	const membershipsResponse = await handleApiCall<Membership[]>(
		() => getMemberships({ org_key: params.orgKey, limit: 100 }, headers),
	);

	let pendingRequestsCount = 0;
	if (isAdmin) {
		const requestsResponse = await handleApiCall<MembershipRequest[]>(
			() => getMembershipRequests(headers, { org_key: params.orgKey }),
		);
		if ('data' in requestsResponse) {
			pendingRequestsCount = requestsResponse.data.length;
		}
	}

	return {
		memberships: 'data' in membershipsResponse ? membershipsResponse.data : [],
		pendingRequestsCount,
	};
};

export const actions: Actions = {
	addMember: async ({ request, params, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const emailOrNickname = (formData.get('email_or_nickname') as string)?.trim();
		const role = (formData.get('role') as string) || 'member';

		if (!emailOrNickname) {
			return fail(400, { errors: [{ message: 'Email or nickname is required' }] });
		}

		// Find user by email or nickname
		const usersResponse = await handleApiCall<User[]>(
			() => getUsers(headers, { email: emailOrNickname }),
		);

		let user: User | undefined;
		if ('data' in usersResponse && usersResponse.data.length > 0) {
			user = usersResponse.data[0];
		} else {
			const nicknameResponse = await handleApiCall<User[]>(
				() => getUsers(headers, { nickname: emailOrNickname }),
			);
			if ('data' in nicknameResponse && nicknameResponse.data.length > 0) {
				user = nicknameResponse.data[0];
			}
		}

		if (!user) {
			return fail(400, { errors: [{ message: `User not found: ${emailOrNickname}` }] });
		}

		const orgResponse = await handleApiCall<Organization>(
			() => getOrganizationByKey(params.orgKey, headers),
		);
		if (!('data' in orgResponse)) {
			return fail(400, { errors: [{ message: 'Organization not found' }] });
		}

		const requestResponse = await handleApiCall<MembershipRequest>(
			() => createMembershipRequest(orgResponse.data.guid, user!.guid, role, headers),
		);

		if ('data' in requestResponse) {
			const acceptResponse = await handleApiCall<Membership>(
				() => acceptMembershipRequest(requestResponse.data.guid, headers),
			);
			if ('errors' in acceptResponse) {
				return fail(400, { errors: acceptResponse.errors });
			}
			return { success: true };
		}

		if ('errors' in requestResponse) {
			return fail(400, { errors: requestResponse.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},

	removeMember: async ({ request, locals }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const guid = formData.get('guid') as string;

		const response = await handleApiCall<void>(
			() => deleteMembership(guid, headers),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},

	makeAdmin: async ({ request, locals, params }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const userGuid = formData.get('user_guid') as string;

		const orgResponse = await handleApiCall<Organization>(
			() => getOrganizationByKey(params.orgKey, headers),
		);
		if (!('data' in orgResponse)) {
			return fail(400, { errors: [{ message: 'Organization not found' }] });
		}

		const requestResponse = await handleApiCall<MembershipRequest>(
			() => createMembershipRequest(orgResponse.data.guid, userGuid, 'admin', headers),
		);

		if ('data' in requestResponse) {
			const acceptResponse = await handleApiCall<Membership>(
				() => acceptMembershipRequest(requestResponse.data.guid, headers),
			);
			if ('errors' in acceptResponse) {
				return fail(400, { errors: acceptResponse.errors });
			}
			return { success: true };
		}

		if ('errors' in requestResponse) {
			return fail(400, { errors: requestResponse.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},

	revokeAdmin: async ({ request, locals, params }) => {
		const session = requireAuthForAction(locals);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const userGuid = formData.get('user_guid') as string;

		// Find admin membership for this user and remove it
		const membershipsResponse = await handleApiCall<Membership[]>(
			() => getMemberships({ org_key: params.orgKey, user_guid: userGuid, role: 'admin' }, headers),
		);

		if ('data' in membershipsResponse) {
			for (const m of membershipsResponse.data) {
				await handleApiCall<void>(
					() => deleteMembership(m.guid, headers),
				);
			}
			return { success: true };
		}

		if ('errors' in membershipsResponse) {
			return fail(400, { errors: membershipsResponse.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
