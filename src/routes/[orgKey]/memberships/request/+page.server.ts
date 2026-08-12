import type { PageServerLoad, Actions } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail, actionFailMissing } from '$lib/api/action-error';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import type { Membership, MembershipRequest, Organization } from '$generated/com-bryzek-apibuilder';
import { MembershipRole } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);
  const { params } = event;

  // Check if already a member
  const membershipsResponse = await handleApiCall<Membership[]>(() =>
    apiBuilderClient().getMemberships({ orgKey: params.orgKey, userId: session.user.id, limit: 25, offset: 0, headers })
  );
  const isMember = dataOr(membershipsResponse, []).length > 0;

  // Check if already requested
  const requestsResponse = await handleApiCall<MembershipRequest[]>(() =>
    apiBuilderClient().getMembershipRequests({ orgKey: params.orgKey, userId: session.user.id, limit: 25, offset: 0, headers })
  );
  const hasPendingRequest = dataOr(requestsResponse, []).length > 0;

  // Both checks default to false, which is exactly the state that offers the join
  // button — so a failed lookup must suppress the form rather than invite a duplicate.
  return { isMember, hasPendingRequest, loadError: loadErrorFrom(membershipsResponse, requestsResponse) };
};

export const actions: Actions = {
  default: async ({ locals, params }) => {
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);

    const orgResponse = await handleApiCall<Organization>(() => apiBuilderClient().getOrganizationByKey(params.orgKey, { headers }));
    if (isApiError(orgResponse)) {
      return actionFailMissing(orgResponse, 'Organization not found');
    }

    const response = await handleApiCall<MembershipRequest>(() =>
      apiBuilderClient().createMembershipRequest({
        body: { org_id: orgResponse.data.id, user_id: session.user.id, role: MembershipRole.Member },
        headers
      })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    return { success: true };
  }
};
