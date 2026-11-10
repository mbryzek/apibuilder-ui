import { ctx } from '#lib/telemetry/context.ts';
import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom, type LoadError } from '#lib/api/load-error.ts';
import type { Item } from '#generated/com-bryzek-apibuilder.ts';
import { PAGE_FETCH_LIMIT, PAGE_LIMIT, parseOffset, toPage } from '#lib/pagination.ts';

export const load: PageServerLoad = async (event) => {
  const { url, locals } = event;
  const headers = getSessionHeaders(locals.session?.id);
  const q = url.searchParams.get('q') || '';
  const offset = parseOffset(url);

  let items: Item[] = [];
  let hasMore = false;
  let loadError: LoadError | null = null;

  if (q) {
    const response = await handleApiCall<Item[]>(() =>
      apiBuilderClient({ headers }).getItems(ctx(event, 'load'), { q, limit: PAGE_FETCH_LIMIT, offset })
    );
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
