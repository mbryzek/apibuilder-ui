import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import type { Change } from '$generated/com-bryzek-apibuilder';
import { PAGE_LIMIT, parseOffset } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);

  const response = await handleApiCall<Change[]>(() => apiBuilderClient().getChanges({ limit: PAGE_LIMIT, offset, headers }));

  const changes = dataOr(response, []);

  return {
    changes,
    offset,
    limit: PAGE_LIMIT,
    hasMore: changes.length >= PAGE_LIMIT,
    loadError: loadErrorFrom(response)
  };
};
