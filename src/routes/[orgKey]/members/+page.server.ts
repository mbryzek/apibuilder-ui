import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import type { Membership, User, MembershipRequest, Organization } from '$generated/types';
import { MembershipRole } from '$generated/types';

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const { params, parent, locals } = event;
	const { isAdmin } = await parent();

	const membershipsResponse = await handleApiCall<Membership[]>(
		() => locals.apiClient.getMemberships({ orgKey: params.orgKey, limit: 100, offset: 0, headers }),
	);

	let pendingRequestsCount = 0;
	if (isAdmin) {
		const requestsResponse = await handleApiCall<MembershipRequest[]>(
			() => locals.apiClient.getMembershipRequests({ orgKey: params.orgKey, limit: 100, offset: 0, headers }),
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
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const emailOrNickname = (formData.get('email_or_nickname') as string)?.trim();
		const roleRaw = formData.get('role') as string;
		const role = Object.values(MembershipRole).includes(roleRaw as MembershipRole) ? roleRaw as MembershipRole : MembershipRole.Member;

		if (!emailOrNickname) {
			return fail(400, { errors: [{ message: 'Email or nickname is required' }] });
		}

		// Find user by email or nickname
		const usersResponse = await handleApiCall<User[]>(
			() => locals.apiClient.getUsers({ email: emailOrNickname, headers }),
		);

		let user: User | undefined;
		if ('data' in usersResponse && usersResponse.data.length > 0) {
			user = usersResponse.data[0];
		} else {
			const nicknameResponse = await handleApiCall<User[]>(
				() => locals.apiClient.getUsers({ nickname: emailOrNickname, headers }),
			);
			if ('data' in nicknameResponse && nicknameResponse.data.length > 0) {
				user = nicknameResponse.data[0];
			}
		}

		if (!user) {
			return fail(400, { errors: [{ message: `User not found: ${emailOrNickname}` }] });
		}

		const orgResponse = await handleApiCall<Organization>(
			() => locals.apiClient.getOrganizationByKey(params.orgKey, { headers }),
		);
		if (!('data' in orgResponse)) {
			return fail(400, { errors: [{ message: 'Organization not found' }] });
		}

		const requestResponse = await handleApiCall<MembershipRequest>(
			() => locals.apiClient.createMembershipRequest({ orgGuid: orgResponse.data.guid, userGuid: user!.guid, role: role as MembershipRole, headers }),
		);

		if ('data' in requestResponse) {
			const acceptResponse = await handleApiCall<void>(
				() => locals.apiClient.createMembershipRequestAcceptByGuid(requestResponse.data.guid, { headers }),
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

	removeMember: async ({ request, locals, params }) => {
		await requireAdminForAction(locals, params.orgKey);
		const session = locals.session!;
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const guid = formData.get('guid');

		if (!guid || typeof guid !== 'string') {
			return fail(400, { errors: [{ message: 'Invalid request' }] });
		}

		const response = await handleApiCall<void>(
			() => locals.apiClient.deleteMembershipByGuid(guid, { headers }),
		);

		if ('errors' in response) {
			return fail(400, { errors: response.errors });
		}

		return { success: true };
	},

	makeAdmin: async ({ request, locals, params }) => {
		const session = await requireAdminForAction(locals, params.orgKey);
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const userGuid = formData.get('user_guid');

		if (!userGuid || typeof userGuid !== 'string') {
			return fail(400, { errors: [{ message: 'Invalid request' }] });
		}

		const orgResponse = await handleApiCall<Organization>(
			() => locals.apiClient.getOrganizationByKey(params.orgKey, { headers }),
		);
		if (!('data' in orgResponse)) {
			return fail(400, { errors: [{ message: 'Organization not found' }] });
		}

		const requestResponse = await handleApiCall<MembershipRequest>(
			() => locals.apiClient.createMembershipRequest({ orgGuid: orgResponse.data.guid, userGuid, role: MembershipRole.Admin, headers }),
		);

		if ('data' in requestResponse) {
			const acceptResponse = await handleApiCall<void>(
				() => locals.apiClient.createMembershipRequestAcceptByGuid(requestResponse.data.guid, { headers }),
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
		await requireAdminForAction(locals, params.orgKey);
		const session = locals.session!;
		const headers = getSessionHeaders(session.id);
		const formData = await request.formData();
		const userGuid = formData.get('user_guid');

		if (!userGuid || typeof userGuid !== 'string') {
			return fail(400, { errors: [{ message: 'Invalid request' }] });
		}

		const membershipsResponse = await handleApiCall<Membership[]>(
			() => locals.apiClient.getMemberships({ orgKey: params.orgKey, userGuid, role: MembershipRole.Admin, limit: 100, offset: 0, headers }),
		);

		if ('data' in membershipsResponse) {
			for (const m of membershipsResponse.data) {
				const deleteResponse = await handleApiCall<void>(
					() => locals.apiClient.deleteMembershipByGuid(m.guid, { headers }),
				);
				if ('errors' in deleteResponse) {
					return fail(400, { errors: deleteResponse.errors });
				}
			}
			return { success: true };
		}

		if ('errors' in membershipsResponse) {
			return fail(400, { errors: membershipsResponse.errors });
		}

		return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
	},
};
