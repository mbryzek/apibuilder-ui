import type { PageServerLoad } from './$types';
import { generatorClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import type { Generator } from '$generated/com-bryzek-apibuilder-generator';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '$lib/pagination';

/**
 * The filter is a server round-trip, not a pass over `generators` in the page.
 *
 * Filtering here is the only place the whole catalog is in hand: the page holds one server page of
 * PAGE_LIMIT rows, so a filter applied there searches 25 of N generators while presenting itself as
 * a filter over all of them, and a generator sorting past the page boundary is reported as
 * nonexistent (ISS-495). `q` goes to the API, which filters and then paginates the matches.
 */
export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const q = url.searchParams.get('q') ?? '';
  const offset = parseOffset(url);

  // Spread rather than `q: q || undefined`: `exactOptionalPropertyTypes` makes an explicit
  // `undefined` a type error, and omitting the param is what "no filter" means on the wire.
  const response = await handleApiCall<Generator[]>(() =>
    generatorClient().getGenerators({ ...(q ? { q: q } : {}), limit: PAGE_FETCH_LIMIT, offset, headers })
  );

  const { rows: generators, ...page } = toPage(dataOr(response, []), offset);

  return {
    generators,
    q,
    ...page,
    loadError: loadErrorFrom(response)
  };
};
