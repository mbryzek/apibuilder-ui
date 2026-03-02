import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getGeneratorByKey, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { GeneratorWithService } from '$generated/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<GeneratorWithService>(
		() => getGeneratorByKey(params.key, headers),
	);

	if (!('data' in response)) {
		throw error(response.status === 404 ? 404 : 500, 'Generator not found');
	}

	return {
		generator: response.data,
	};
};
