import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Item } from '$generated/com-bryzek-apibuilder';
import { PAGE_LIMIT, parseOffset } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const q = url.searchParams.get('q') || '';
  const offset = parseOffset(url);

  let items: Item[] = [];
  let hasMore = false;

  if (q) {
    const response = await handleApiCall<Item[]>(() => apiBuilderClient().getItems({ q, limit: PAGE_LIMIT, offset, headers }));
    items = 'data' in response ? response.data : [];
    hasMore = items.length >= PAGE_LIMIT;
  }

  return {
    items,
    q,
    offset,
    limit: PAGE_LIMIT,
    hasMore
  };
};
