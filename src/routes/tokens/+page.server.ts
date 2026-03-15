import type { PageServerLoad } from './$types';
import { getTokens, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth } from '$lib/server/auth';
import type { Token } from '$generated/types';

const LIMIT = 25;

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const offset = Number(event.url.searchParams.get('offset') || '0');

	const response = await handleApiCall<Token[]>(
		() => getTokens(session.user.id, headers, { limit: LIMIT, offset }),
	);

	const tokens = 'data' in response ? response.data : [];

	return {
		tokens,
		offset,
		hasMore: tokens.length >= LIMIT,
	};
};
