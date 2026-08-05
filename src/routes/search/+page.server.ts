import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom, type LoadError } from '$lib/api/load-error';
import type { Item } from '$generated/com-bryzek-apibuilder';
import { PAGE_LIMIT, parseOffset } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const q = url.searchParams.get('q') || '';
  const offset = parseOffset(url);

  let items: Item[] = [];
  let hasMore = false;
  let loadError: LoadError | null = null;

  if (q) {
    const response = await handleApiCall<Item[]>(() => apiBuilderClient().getItems({ q, limit: PAGE_LIMIT, offset, headers }));
    items = dataOr(response, []);
    hasMore = items.length >= PAGE_LIMIT;
    loadError = loadErrorFrom(response);
  }

  return {
    items,
    q,
    offset,
    limit: PAGE_LIMIT,
    hasMore,
    loadError
  };
};
