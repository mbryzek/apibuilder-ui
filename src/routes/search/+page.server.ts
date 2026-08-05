import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom, type LoadError } from '$lib/api/load-error';
import type { Item } from '$generated/com-bryzek-apibuilder';
import { PAGE_FETCH_LIMIT, PAGE_LIMIT, parseOffset, toPage } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const q = url.searchParams.get('q') || '';
  const offset = parseOffset(url);

  let items: Item[] = [];
  let hasMore = false;
  let loadError: LoadError | null = null;

  if (q) {
    const response = await handleApiCall<Item[]>(() => apiBuilderClient().getItems({ q, limit: PAGE_FETCH_LIMIT, offset, headers }));
    const page = toPage(dataOr(response, []), offset);
    items = page.rows;
    hasMore = page.hasMore;
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
