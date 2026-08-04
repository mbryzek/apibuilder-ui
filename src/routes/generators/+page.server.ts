import type { PageServerLoad } from './$types';
import { generatorClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Generator } from '$generated/com-bryzek-apibuilder-generator';
import { PAGE_LIMIT, parseOffset } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);

  const response = await handleApiCall<Generator[]>(() => generatorClient().getGenerators({ limit: PAGE_LIMIT, offset, headers }));

  const generators = 'data' in response ? response.data : [];

  return {
    generators,
    offset,
    limit: PAGE_LIMIT,
    hasMore: generators.length >= PAGE_LIMIT
  };
};
