import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import type { Change } from '$generated/com-bryzek-apibuilder';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);

  const response = await handleApiCall<Change[]>(() => apiBuilderClient({ headers }).getChanges({ limit: PAGE_FETCH_LIMIT, offset }));

  const { rows: changes, ...page } = toPage(dataOr(response, []), offset);

  return {
    changes,
    ...page,
    loadError: loadErrorFrom(response)
  };
};
