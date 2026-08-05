import type { PageServerLoad } from './$types';
import { generatorClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import type { Generator } from '$generated/com-bryzek-apibuilder-generator';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);

  const response = await handleApiCall<Generator[]>(() => generatorClient().getGenerators({ limit: PAGE_FETCH_LIMIT, offset, headers }));

  const { rows: generators, ...page } = toPage(dataOr(response, []), offset);

  return {
    generators,
    ...page,
    loadError: loadErrorFrom(response)
  };
};
