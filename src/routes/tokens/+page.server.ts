import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { requireAuth } from '$lib/server/auth';
import type { Token } from '$generated/com-bryzek-apibuilder';

const LIMIT = 25;

export const load: PageServerLoad = async (event) => {
	const session = requireAuth(event);
	const headers = getSessionHeaders(session.id);
	const offset = Number(event.url.searchParams.get('offset') || '0');

	const response = await handleApiCall<Token[]>(
		() => apiBuilderClient().getTokensUsersByUserId({ userId: session.user.id, limit: LIMIT, offset, headers }),
	);

	const tokens = 'data' in response ? response.data : [];

	return {
		tokens,
		offset,
		hasMore: tokens.length >= LIMIT,
	};
};
