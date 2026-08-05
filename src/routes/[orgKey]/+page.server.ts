import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, type ApiResponse } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import type { Application, MembershipRequest } from '$generated/com-bryzek-apibuilder';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '$lib/pagination';

export const load: PageServerLoad = async ({ params, parent, locals, url }) => {
  const { isAdmin } = await parent();
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);

  const appsResponse = await handleApiCall<Application[]>(() =>
    apiBuilderClient().getApplications({ orgKey: params.orgKey, hasVersion: true, limit: PAGE_FETCH_LIMIT, offset, headers })
  );

  const { rows: applications, ...page } = toPage(dataOr(appsResponse, []), offset);

  let hasPendingRequests = false;
  let requestsResponse: ApiResponse<MembershipRequest[]> | null = null;
  if (isAdmin && locals.session) {
    requestsResponse = await handleApiCall<MembershipRequest[]>(() =>
      apiBuilderClient().getMembershipRequests({ orgKey: params.orgKey, limit: 1, offset: 0, headers })
    );
    hasPendingRequests = dataOr(requestsResponse, []).length > 0;
  }

  return {
    applications,
    ...page,
    hasPendingRequests,
    loadError: loadErrorFrom(appsResponse, requestsResponse)
  };
};
