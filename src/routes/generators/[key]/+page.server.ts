import type { PageServerLoad } from './$types';
import { generatorClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { error } from '@sveltejs/kit';
import type { Generator } from '$generated/com-bryzek-apibuilder-generator';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<Generator>(
		() => generatorClient().getGeneratorByKey(params.key, { headers }),
	);

	if ('data' in response) {
		return { generator: response.data };
	}

	throw error(404, 'Generator not found');
};
