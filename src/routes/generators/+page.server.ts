import type { PageServerLoad } from './$types';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { GeneratorWithService } from '$generated/types';

const LIMIT = 25;

export const load: PageServerLoad = async ({ url, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const offset = Number(url.searchParams.get('offset') || '0');

	const response = await handleApiCall<GeneratorWithService[]>(
		() => locals.apiClient.getGeneratorWithServices({ limit: LIMIT, offset, headers }),
	);

	const generators = 'data' in response ? response.data : [];

	return {
		generators,
		offset,
		hasMore: generators.length >= LIMIT,
	};
};
