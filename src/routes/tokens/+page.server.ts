import type { PageServerLoad } from './$types';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth } from '$lib/server/auth';
import type { Token } from '$generated/com-bryzek-platform';
import { PAGE_LIMIT, parseOffset } from '$lib/pagination';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);
  const offset = parseOffset(event.url);

  const response = await handleApiCall<Token[]>(() =>
    platformClient().getTokensUsersByUserId({ userId: session.user.id, limit: PAGE_LIMIT, offset, headers })
  );

  const tokens = 'data' in response ? response.data : [];

  return {
    tokens,
    offset,
    limit: PAGE_LIMIT,
    hasMore: tokens.length >= PAGE_LIMIT
  };
};
