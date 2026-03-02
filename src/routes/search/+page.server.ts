import type { PageServerLoad } from './$types';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Item } from '$generated/types';

const LIMIT = 25;

export const load: PageServerLoad = async ({ url, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const q = url.searchParams.get('q') || '';
	const offset = Number(url.searchParams.get('offset') || '0');

	let items: Item[] = [];
	let hasMore = false;

	if (q) {
		const response = await handleApiCall<Item[]>(
			() => locals.apiClient.getItems({ q, limit: LIMIT, offset, headers }),
		);
		items = 'data' in response ? response.data : [];
		hasMore = items.length >= LIMIT;
	}

	return {
		items,
		q,
		offset,
		hasMore,
	};
};
