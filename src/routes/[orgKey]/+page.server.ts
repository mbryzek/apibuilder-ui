import { ctx } from '#lib/telemetry/context.ts';
import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, type ApiResponse } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom } from '#lib/api/load-error.ts';
import type { Application, MembershipRequest } from '#generated/com-bryzek-apibuilder.ts';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '#lib/pagination.ts';

export const load: PageServerLoad = async (event) => {
  const { params, parent, locals, url } = event;
  const { isAdmin } = await parent();
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient({ headers });
  const offset = parseOffset(url);

  const appsResponse = await handleApiCall<Application[]>(() =>
    client.getApplications(ctx(event, 'load'), { orgKey: params.orgKey, hasVersion: true, limit: PAGE_FETCH_LIMIT, offset })
  );

  const { rows: applications, ...page } = toPage(dataOr(appsResponse, []), offset);

  let hasPendingRequests = false;
  let requestsResponse: ApiResponse<MembershipRequest[]> | null = null;
  if (isAdmin && locals.session) {
    requestsResponse = await handleApiCall<MembershipRequest[]>(() =>
      client.getMembershipRequests(ctx(event, 'load'), { orgKey: params.orgKey, limit: 1, offset: 0 })
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
