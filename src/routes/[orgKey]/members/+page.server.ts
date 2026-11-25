import { ctx } from '#lib/telemetry/context.ts';
import type { CallContext } from '#lib/telemetry/context.ts';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, isApiError, isApiSuccess, type ApiResponse } from '#lib/api/error-handler.ts';
import { actionFail, actionFailMissing } from '#lib/api/action-error.ts';
import { dataOr, loadErrorFrom } from '#lib/api/load-error.ts';
import { requireAuth, adminClient } from '#lib/server/auth.ts';
import { requiredEnum, requiredString } from '#lib/server/form.ts';
import { PAGE_FETCH_LIMIT, PAGE_LIMIT, parseOffset, toPage } from '#lib/pagination.ts';
import { adminGuidAction, type AdminActionEvent, type OrgScope } from '#lib/server/scoped-action.ts';
import type { Membership, User, MembershipRequest, Organization } from '#generated/com-bryzek-apibuilder.ts';
import { MembershipRole, MembershipStatus } from '#generated/com-bryzek-apibuilder.ts';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);
  const client = apiBuilderClient({ headers });
  const { params, parent } = event;
  const { isAdmin } = await parent();

  const offset = parseOffset(event.url);

  const membershipsResponse = await handleApiCall<Membership[]>(() =>
    client.getMemberships(ctx(event, 'load'), { orgKey: params.orgKey, limit: PAGE_FETCH_LIMIT, offset })
  );

  let pendingRequestsCount = 0;
  let pendingRequestsCapped = false;
  let requestsResponse: ApiResponse<MembershipRequest[]> | null = null;
  if (isAdmin) {
    requestsResponse = await handleApiCall<MembershipRequest[]>(() =>
      client.getMembershipRequests(ctx(event, 'load'), { orgKey: params.orgKey, limit: PAGE_FETCH_LIMIT, offset: 0 })
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

const membershipsInOrg: OrgScope<Membership> = (context, client, orgKey) => (limit, offset) =>
  handleApiCall<Membership[]>(() => client.getMemberships(context, { orgKey, limit, offset }));

type MembersEvent = Parameters<Actions['addMember']>[0];
type ApiBuilderClient = Awaited<ReturnType<typeof adminClient>>['client'];

async function addByEmail(event: MembersEvent, client: ApiBuilderClient, email: string, role: MembershipRole) {
  const response = await handleApiCall<Membership>(() =>
    client.createMembership(ctx(event, 'form'), { body: { org_key: event.params.orgKey, email, role } })
  );
  if (isApiError(response)) {
    return actionFail(response);
  }
  const membership = response.data;
  return membership.status === MembershipStatus.Invited ? { success: true, membership, invited: email } : { success: true, membership };
}

function changeRole(context: CallContext, event: AdminActionEvent, role: MembershipRole) {
  return adminGuidAction(
    context,
    event,
    membershipsInOrg,
    (membership, client) => client.updateMembershipById(context, { id: membership.id, body: { role } }),
    (_, membership) => ({ membership })
  );
}

export const actions: Actions = {
  addMember: async (event) => {
    const { request, params, locals } = event;
    const { client } = await adminClient(ctx(event, 'form'), locals, params.orgKey);
    const formData = await request.formData();
    const emailOrNickname = requiredString(formData, 'email_or_nickname');
    const role = requiredEnum(formData, 'role', Object.values(MembershipRole)) ?? MembershipRole.Member;

    if (!emailOrNickname) {
      return fail(400, { errors: [{ message: 'Email, nickname or user ID is required' }] });
    }

    if (emailOrNickname.includes('@')) {
      return addByEmail(event, client, emailOrNickname, role);
    }

    let lookup = await handleApiCall<User[]>(() => client.getUsers(ctx(event, 'form'), { nickname: emailOrNickname }));
    if (isApiSuccess(lookup) && lookup.data.length === 0) {
      lookup = await handleApiCall<User[]>(() => client.getUsers(ctx(event, 'form'), { id: emailOrNickname }));
    }
    const user = isApiSuccess(lookup) ? lookup.data[0] : undefined;

    if (!user) {
      return actionFailMissing(lookup, `User not found: ${emailOrNickname}`);
    }

    const orgResponse = await handleApiCall<Organization>(() => client.getOrganizationByKey(ctx(event, 'form'), params.orgKey));
    if (isApiError(orgResponse)) {
      return actionFailMissing(orgResponse, 'Organization not found');
    }

    const requestResponse = await handleApiCall<MembershipRequest>(() =>
      client.createMembershipRequest(ctx(event, 'form'), {
        body: { org_id: orgResponse.data.id, user_id: user.id, role }
      })
    );

    if (isApiError(requestResponse)) {
      return actionFail(requestResponse);
    }

    const acceptResponse = await handleApiCall<Membership>(() =>
      client.createMembershipRequestAcceptById(ctx(event, 'form'), requestResponse.data.id)
    );

    if (isApiError(acceptResponse)) {
      return actionFail(acceptResponse);
    }

    return { success: true, membership: acceptResponse.data };
  },

  removeMember: (event) =>
    adminGuidAction(
      ctx(event, 'form'),
      event,
      membershipsInOrg,
      (membership, client) => client.deleteMembershipById(ctx(event, 'form'), membership.id),
      (membership) => ({ removed: membership.id })
    ),

  makeAdmin: (event) => changeRole(ctx(event, 'form'), event, MembershipRole.Admin),

  revokeAdmin: (event) => changeRole(ctx(event, 'form'), event, MembershipRole.Member)
};
