import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Application, MembershipRequest } from '$generated/com-bryzek-apibuilder';
import { PAGE_LIMIT, parseOffset } from '$lib/pagination';

export const load: PageServerLoad = async ({ params, parent, locals, url }) => {
  const { isAdmin } = await parent();
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);

  const appsResponse = await handleApiCall<Application[]>(() =>
    apiBuilderClient().getApplications({ orgKey: params.orgKey, hasVersion: true, limit: PAGE_LIMIT, offset, headers })
  );

  const applications = 'data' in appsResponse ? appsResponse.data : [];

  let hasPendingRequests = false;
  if (isAdmin && locals.session) {
    const requestsResponse = await handleApiCall<MembershipRequest[]>(() =>
      apiBuilderClient().getMembershipRequests({ orgKey: params.orgKey, limit: 1, offset: 0, headers })
    );
    if ('data' in requestsResponse) {
      hasPendingRequests = requestsResponse.data.length > 0;
    }
  }

  return {
    applications,
    offset,
    limit: PAGE_LIMIT,
    hasMore: applications.length >= PAGE_LIMIT,
    hasPendingRequests
  };
};
