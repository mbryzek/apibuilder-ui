import type { PageServerLoad } from './$types';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { ApiAttribute } from '$generated/types';

const LIMIT = 25;

export const load: PageServerLoad = async ({ url, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const offset = Number(url.searchParams.get('offset') || '0');

	const response = await handleApiCall<ApiAttribute[]>(
		() => locals.apiClient.getAttributes({ limit: LIMIT, offset, headers }),
	);

	const attributes = 'data' in response ? response.data : [];

	return {
		attributes,
		offset,
		hasMore: attributes.length >= LIMIT,
	};
};
