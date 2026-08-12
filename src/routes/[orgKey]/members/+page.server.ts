import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError, isApiSuccess, type ApiResponse } from '$lib/api/error-handler';
import { actionFail, actionFailMissing } from '$lib/api/action-error';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { PAGE_FETCH_LIMIT, PAGE_LIMIT, parseOffset, toPage } from '$lib/pagination';
import { findScopedById, outOfScope } from '$lib/server/scoped-id';
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

    // Find user by email or nickname. The email lookup is allowed to fail — an `emailOrNickname`
    // that is a nickname is not a valid email — so the last lookup is the one that decides, and
    // `actionFailMissing` keeps an unanswered one from reading as "no such user".
    let lookup = await handleApiCall<User[]>(() => apiBuilderClient().getUsers({ email: emailOrNickname, headers }));
    let user = isApiSuccess(lookup) ? lookup.data[0] : undefined;

    if (!user) {
      lookup = await handleApiCall<User[]>(() => apiBuilderClient().getUsers({ nickname: emailOrNickname, headers }));
      user = isApiSuccess(lookup) ? lookup.data[0] : undefined;
    }

    if (!user) {
      return actionFailMissing(lookup, `User not found: ${emailOrNickname}`);
    }

    const orgResponse = await handleApiCall<Organization>(() => apiBuilderClient().getOrganizationByKey(params.orgKey, { headers }));
    if (isApiError(orgResponse)) {
      return actionFailMissing(orgResponse, 'Organization not found');
    }

    const requestResponse = await handleApiCall<MembershipRequest>(() =>
      apiBuilderClient().createMembershipRequest({
        body: { org_id: orgResponse.data.id, user_id: user.id, role: role as MembershipRole },
        headers
      })
    );

    if (isApiError(requestResponse)) {
      return actionFail(requestResponse);
    }

    const acceptResponse = await handleApiCall<Membership>(() =>
      apiBuilderClient().createMembershipRequestAcceptById(requestResponse.data.id, { headers })
    );

    if (isApiError(acceptResponse)) {
      return actionFail(acceptResponse);
    }

    return { success: true };
  },

  removeMember: async ({ request, locals, params }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const guid = formData.get('guid');

    if (!guid || typeof guid !== 'string') {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    // Resolve the membership within the org that was just authorized, and delete the id that
    // came back — the same discipline `revokeAdmin` below already used. See
    // `$lib/server/scoped-id`.
    const membership = await findScopedById<Membership>(guid, (limit, offset) =>
      handleApiCall<Membership[]>(() => apiBuilderClient().getMemberships({ orgKey: params.orgKey, limit, offset, headers }))
    );
    if (!membership) {
      return outOfScope();
    }

    const response = await handleApiCall<void>(() => apiBuilderClient().deleteMembershipById(membership.id, { headers }));

    if (isApiError(response)) {
      return actionFail(response);
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
    if (isApiError(orgResponse)) {
      return actionFailMissing(orgResponse, 'Organization not found');
    }

    const requestResponse = await handleApiCall<MembershipRequest>(() =>
      apiBuilderClient().createMembershipRequest({
        body: { org_id: orgResponse.data.id, user_id: userId, role: MembershipRole.Admin },
        headers
      })
    );

    if (isApiError(requestResponse)) {
      return actionFail(requestResponse);
    }

    const acceptResponse = await handleApiCall<Membership>(() =>
      apiBuilderClient().createMembershipRequestAcceptById(requestResponse.data.id, { headers })
    );

    if (isApiError(acceptResponse)) {
      return actionFail(acceptResponse);
    }

    return { success: true };
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

    if (isApiError(membershipsResponse)) {
      return actionFail(membershipsResponse);
    }

    for (const m of membershipsResponse.data) {
      const deleteResponse = await handleApiCall<void>(() => apiBuilderClient().deleteMembershipById(m.id, { headers }));
      if (isApiError(deleteResponse)) {
        return actionFail(deleteResponse);
      }
    }

    return { success: true };
  }
};
