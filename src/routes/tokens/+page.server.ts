import type { PageServerLoad } from './$types';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth } from '$lib/server/auth';
import type { Token } from '$generated/com-bryzek-platform';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '$lib/pagination';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);
  const offset = parseOffset(event.url);

  const response = await handleApiCall<Token[]>(() =>
    platformClient({ headers }).getTokensUsersByUserId({ userId: session.user.id, limit: PAGE_FETCH_LIMIT, offset })
  );

  const { rows: tokens, ...page } = toPage(dataOr(response, []), offset);

  return {
    tokens,
    ...page,
    loadError: loadErrorFrom(response)
  };
};
