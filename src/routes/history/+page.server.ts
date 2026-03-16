import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Change } from '$generated/com-bryzek-bryzek-apibuilder-v0';

const LIMIT = 25;

export const load: PageServerLoad = async ({ url, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const offset = Number(url.searchParams.get('offset') || '0');

	const response = await handleApiCall<Change[]>(
		() => apiBuilderClient().getChanges({ limit: LIMIT, offset, headers }),
	);

	const changes = 'data' in response ? response.data : [];

	return {
		changes,
		offset,
		hasMore: changes.length >= LIMIT,
	};
};
