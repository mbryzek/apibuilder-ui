import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth } from '$lib/server/auth';
import { adminGuidAction, type OrgScope } from '$lib/server/scoped-action';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '$lib/pagination';
import type { MembershipRequest } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const { isAdmin } = await event.parent();
  if (!isAdmin) {
    throw error(403, 'Forbidden');
  }
  const headers = getSessionHeaders(session.id);

  // Accepting a request is only reachable from this list, so a row past the page size is a person
  // who cannot be admitted at all. The members page already links here saying "25+", so the app
  // was telling an admin there were more and then showing a page that could not reach them.
  const offset = parseOffset(event.url);

  const response = await handleApiCall<MembershipRequest[]>(() =>
    apiBuilderClient({ headers }).getMembershipRequests({ orgKey: event.params.orgKey, limit: PAGE_FETCH_LIMIT, offset })
  );

  const { rows: requests, ...page } = toPage(dataOr(response, []), offset);

  return {
    requests,
    ...page,
    loadError: loadErrorFrom(response)
  };
};

/**
 * This org's pending requests, the scope a form's `guid` is resolved within.
 *
 * Accepting a request is the act that grants access to an organization, so the id has to come
 * from the org the caller was just checked to administer rather than straight from the form
 * body — where it names whatever org the submitter likes. See `$lib/server/scoped-action`.
 */
const requestsInOrg: OrgScope<MembershipRequest> = (client, orgKey) => (limit, offset) =>
  handleApiCall<MembershipRequest[]>(() => client.getMembershipRequests({ orgKey, limit, offset }));

export const actions: Actions = {
  accept: (event) => adminGuidAction(event, requestsInOrg, (req, client) => client.createMembershipRequestAcceptById(req.id)),

  decline: (event) => adminGuidAction(event, requestsInOrg, (req, client) => client.createMembershipRequestDeclineById(req.id))
};
