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

  // The badge used to render the length of a limit-capped page as though it were a total, so an
  // org with 40 pending requests read "Pending Requests (25)". Over-fetch by one and say "25+"
  // rather than asserting a number we cannot know.
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

/**
 * This org's memberships, the scope a form's `guid` is resolved within.
 *
 * Every guid action below authorizes `params.orgKey` and then acts on an id that arrived
 * separately in the form body, so the id has to be resolved against the org that was authorized
 * rather than trusted. See `#lib/server/scoped-id.ts` and `#lib/server/scoped-action.ts`.
 */
const membershipsInOrg: OrgScope<Membership> = (context, client, orgKey) => (limit, offset) =>
  handleApiCall<Membership[]>(() => client.getMemberships(context, { orgKey, limit, offset }));

type MembersEvent = Parameters<Actions['addMember']>[0];
type ApiBuilderClient = Awaited<ReturnType<typeof adminClient>>['client'];

/**
 * Add a member by email address. `invited` names the address when the platform created the
 * account and sent the invitation, so the page can say an email went out rather than imply the
 * person can already sign in.
 */
async function addByEmail(event: MembersEvent, client: ApiBuilderClient, email: string, role: MembershipRole) {
  const response = await handleApiCall<Membership>(() =>
    client.createMembership(ctx(event, 'form'), { body: { org_key: event.params.orgKey, email, role } })
  );
  if (isApiError(response)) {
    return actionFail(response);
  }
  return response.data.status === MembershipStatus.Invited ? { success: true, invited: email } : { success: true };
}

/**
 * Promotion and demotion are the same act: a role change on the membership the table already
 * shows, which keeps its id and leaves the person in the organization either way.
 *
 * Neither may go through the membership-request path, and demotion in particular may not go
 * through a delete. A user holds exactly ONE membership per organization — accepting a request
 * upserts that row — so accepting an `admin` request promotes the row in place, and accepting a
 * `member` one is a no-op rather than a demotion. Deleting the admin membership therefore does
 * not demote anybody: it removes them from the organization, which is what "Revoke Admin" did
 * before ISS-4833.
 */
function changeRole(context: CallContext, event: AdminActionEvent, role: MembershipRole) {
  return adminGuidAction(context, event, membershipsInOrg, (membership, client) =>
    client.updateMembershipById(context, { id: membership.id, body: { role } })
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
      return fail(400, { errors: [{ message: 'Email or nickname is required' }] });
    }

    // An address goes to the platform whole: it adds the person with an account at once, and
    // creates one for an address that has none and emails them an invitation to set its password.
    if (emailOrNickname.includes('@')) {
      return addByEmail(event, client, emailOrNickname, role);
    }

    const lookup = await handleApiCall<User[]>(() => client.getUsers(ctx(event, 'form'), { nickname: emailOrNickname }));
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

    return { success: true };
  },

  removeMember: (event) =>
    adminGuidAction(ctx(event, 'form'), event, membershipsInOrg, (membership, client) =>
      client.deleteMembershipById(ctx(event, 'form'), membership.id)
    ),

  makeAdmin: (event) => changeRole(ctx(event, 'form'), event, MembershipRole.Admin),

  revokeAdmin: (event) => changeRole(ctx(event, 'form'), event, MembershipRole.Member)
};
