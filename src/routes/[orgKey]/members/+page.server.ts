import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, type ApiResponse } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { PAGE_FETCH_LIMIT, PAGE_LIMIT, parseOffset, toPage } from '$lib/pagination';
import type { Membership, User, MembershipRequest, Organization } from '$generated/com-bryzek-apibuilder';
import { MembershipRole } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);
  const { params, parent } = event;
  const { isAdmin } = await parent();

  const offset = parseOffset(event.url);

  const membershipsResponse = await handleApiCall<Membership[]>(() =>
    apiBuilderClient().getMemberships({ orgKey: params.orgKey, limit: PAGE_FETCH_LIMIT, offset, headers })
  );

  // The badge used to render the length of a limit-capped page as though it were a total, so an
  // org with 40 pending requests read "Pending Requests (25)". Over-fetch by one and say "25+"
  // rather than asserting a number we cannot know.
  let pendingRequestsCount = 0;
  let pendingRequestsCapped = false;
  let requestsResponse: ApiResponse<MembershipRequest[]> | null = null;
  if (isAdmin) {
    requestsResponse = await handleApiCall<MembershipRequest[]>(() =>
      apiBuilderClient().getMembershipRequests({ orgKey: params.orgKey, limit: PAGE_FETCH_LIMIT, offset: 0, headers })
    );
    const pending = dataOr(requestsResponse, []);
    pendingRequestsCount = Math.min(pending.length, PAGE_LIMIT);
    pendingRequestsCapped = pending.length > PAGE_LIMIT;
  }

  const { rows: memberships, ...page } = toPage(dataOr(membershipsResponse, []), offset);

  return {
    memberships,
    ...page,
    pendingRequestsCount,
    pendingRequestsCapped,
    loadError: loadErrorFrom(membershipsResponse, requestsResponse)
  };
};

export const actions: Actions = {
  addMember: async ({ request, params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const emailOrNickname = (formData.get('email_or_nickname') as string)?.trim();
    const roleRaw = formData.get('role') as string;
    const role = Object.values(MembershipRole).includes(roleRaw as MembershipRole) ? roleRaw : 'member';

    if (!emailOrNickname) {
      return fail(400, { errors: [{ message: 'Email or nickname is required' }] });
    }

    // Find user by email or nickname
    const usersResponse = await handleApiCall<User[]>(() => apiBuilderClient().getUsers({ email: emailOrNickname, headers }));

    let user: User | undefined;
    if ('data' in usersResponse && usersResponse.data.length > 0) {
      user = usersResponse.data[0];
    } else {
      const nicknameResponse = await handleApiCall<User[]>(() => apiBuilderClient().getUsers({ nickname: emailOrNickname, headers }));
      if ('data' in nicknameResponse && nicknameResponse.data.length > 0) {
        user = nicknameResponse.data[0];
      }
    }

    if (!user) {
      return fail(400, { errors: [{ message: `User not found: ${emailOrNickname}` }] });
    }

    const orgResponse = await handleApiCall<Organization>(() => apiBuilderClient().getOrganizationByKey(params.orgKey, { headers }));
    if (!('data' in orgResponse)) {
      return fail(400, { errors: [{ message: 'Organization not found' }] });
    }

    const requestResponse = await handleApiCall<MembershipRequest>(() =>
      apiBuilderClient().createMembershipRequest({
        body: { org_id: orgResponse.data.id, user_id: user!.id, role: role as MembershipRole },
        headers
      })
    );

    if ('data' in requestResponse) {
      const acceptResponse = await handleApiCall<Membership>(() =>
        apiBuilderClient().createMembershipRequestAcceptById(requestResponse.data.id, { headers })
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

    const response = await handleApiCall<void>(() => apiBuilderClient().deleteMembershipById(guid, { headers }));

    if ('errors' in response) {
      return fail(400, { errors: response.errors });
    }

    return { success: true };
  },

  makeAdmin: async ({ request, locals, params }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const userId = formData.get('user_id');

    if (!userId || typeof userId !== 'string') {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const orgResponse = await handleApiCall<Organization>(() => apiBuilderClient().getOrganizationByKey(params.orgKey, { headers }));
    if (!('data' in orgResponse)) {
      return fail(400, { errors: [{ message: 'Organization not found' }] });
    }

    const requestResponse = await handleApiCall<MembershipRequest>(() =>
      apiBuilderClient().createMembershipRequest({
        body: { org_id: orgResponse.data.id, user_id: userId, role: MembershipRole.Admin },
        headers
      })
    );

    if ('data' in requestResponse) {
      const acceptResponse = await handleApiCall<Membership>(() =>
        apiBuilderClient().createMembershipRequestAcceptById(requestResponse.data.id, { headers })
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
    const userId = formData.get('user_id');

    if (!userId || typeof userId !== 'string') {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const membershipsResponse = await handleApiCall<Membership[]>(() =>
      apiBuilderClient().getMemberships({ orgKey: params.orgKey, userId, role: MembershipRole.Admin, limit: 100, offset: 0, headers })
    );

    if ('data' in membershipsResponse) {
      for (const m of membershipsResponse.data) {
        const deleteResponse = await handleApiCall<void>(() => apiBuilderClient().deleteMembershipById(m.id, { headers }));
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
  }
};
