import type { PageServerLoad } from './$types';
import { getChanges } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Change } from '$generated/types';

const LIMIT = 25;

export const load: PageServerLoad = async ({ url, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const offset = Number(url.searchParams.get('offset') || '0');

	const response = await handleApiCall<Change[]>(
		() => getChanges(headers, { limit: LIMIT, offset }),
	);

	const changes = 'data' in response ? response.data : [];

	return {
		changes,
		offset,
		hasMore: changes.length >= LIMIT,
	};
};
