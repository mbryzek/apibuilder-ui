import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { findScopedById, outOfScope } from '$lib/server/scoped-id';
import type { MembershipRequest, Membership } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const { isAdmin } = await event.parent();
  if (!isAdmin) {
    throw error(403, 'Forbidden');
  }
  const headers = getSessionHeaders(session.id);

  const response = await handleApiCall<MembershipRequest[]>(() =>
    apiBuilderClient().getMembershipRequests({ orgKey: event.params.orgKey, limit: 25, offset: 0, headers })
  );

  return {
    requests: dataOr(response, []),
    loadError: loadErrorFrom(response)
  };
};

/**
 * The pending request with this id *within this org*, or null.
 *
 * Accepting a request is the act that grants access to an organization, so the id has to come
 * from the org the caller was just checked to administer rather than straight from the form
 * body — where it names whatever org the submitter likes. See `$lib/server/scoped-id`.
 */
async function findRequestInOrg(orgKey: string, guid: string, headers: Record<string, string>) {
  return findScopedById<MembershipRequest>(guid, (limit, offset) =>
    handleApiCall<MembershipRequest[]>(() => apiBuilderClient().getMembershipRequests({ orgKey, limit, offset, headers }))
  );
}

export const actions: Actions = {
  accept: async ({ request, locals, params }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const guid = formData.get('guid');

    if (!guid || typeof guid !== 'string') {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const membershipRequest = await findRequestInOrg(params.orgKey, guid, headers);
    if (!membershipRequest) {
      return outOfScope();
    }

    const response = await handleApiCall<Membership>(() =>
      apiBuilderClient().createMembershipRequestAcceptById(membershipRequest.id, { headers })
    );

    if ('errors' in response) {
      return fail(400, { errors: response.errors });
    }

    return { success: true };
  },

  decline: async ({ request, locals, params }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const guid = formData.get('guid');

    if (!guid || typeof guid !== 'string') {
      return fail(400, { errors: [{ message: 'Invalid request' }] });
    }

    const membershipRequest = await findRequestInOrg(params.orgKey, guid, headers);
    if (!membershipRequest) {
      return outOfScope();
    }

    const response = await handleApiCall<void>(() =>
      apiBuilderClient().createMembershipRequestDeclineById(membershipRequest.id, { headers })
    );

    if ('errors' in response) {
      return fail(400, { errors: response.errors });
    }

    return { success: true };
  }
};
