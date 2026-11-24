import { ctx } from '#lib/telemetry/context.ts';
import type { PageServerLoad, Actions } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { actionFail, actionFailMissing } from '#lib/api/action-error.ts';
import { dataOr, loadErrorFrom } from '#lib/api/load-error.ts';
import { requireAuth, requireAuthForAction } from '#lib/server/auth.ts';
import { assertSafePathParams } from '#lib/server/path-params.ts';
import type { MembershipRequest, Organization } from '#generated/com-bryzek-apibuilder.ts';
import { MembershipRole } from '#generated/com-bryzek-apibuilder.ts';

/**
 * Whether the caller is already a member comes from the `[orgKey]` layout, which reads the same
 * memberships for every screen under the organization; only the pending-request check is this
 * page's own, and it goes out while the layout is still loading.
 */
export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);
  const client = apiBuilderClient({ headers });
  const { params, parent } = event;

  const [{ membershipLoadError }, requestsResponse] = await Promise.all([
    parent(),
    handleApiCall<MembershipRequest[]>(() =>
      client.getMembershipRequests(ctx(event, 'load'), { orgKey: params.orgKey, userId: session.user.id, limit: 25, offset: 0 })
    )
  ]);
  const hasPendingRequest = dataOr(requestsResponse, []).length > 0;

  // Both checks default to false, which is exactly the state that offers the join
  // button — so a failed lookup must suppress the form rather than invite a duplicate.
  return { hasPendingRequest, loadError: membershipLoadError ?? loadErrorFrom(requestsResponse) };
};

export const actions: Actions = {
  default: async (event) => {
    const { locals, params } = event;
    // Any signed-in user may ask to join, so this action deliberately does not use the member
    // guard — which means it does not inherit that guard's orgKey check either.
    assertSafePathParams(params);
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);
    const client = apiBuilderClient({ headers });

    const orgResponse = await handleApiCall<Organization>(() => client.getOrganizationByKey(ctx(event, 'form'), params.orgKey));
    if (isApiError(orgResponse)) {
      return actionFailMissing(orgResponse, 'Organization not found');
    }

    const response = await handleApiCall<MembershipRequest>(() =>
      client.createMembershipRequest(ctx(event, 'form'), {
        body: { org_id: orgResponse.data.id, user_id: session.user.id, role: MembershipRole.Member }
      })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  }
};
