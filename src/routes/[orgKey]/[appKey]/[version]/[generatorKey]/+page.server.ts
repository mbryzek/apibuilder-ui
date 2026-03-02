import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getCode, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Code } from '$generated/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const codeResponse = await handleApiCall<Code>(
		() => getCode(params.orgKey, params.appKey, params.version, params.generatorKey, headers),
	);

	if (!('data' in codeResponse)) {
		throw error(404, 'Generated code not found');
	}

	return {
		code: codeResponse.data,
		generatorKey: params.generatorKey,
	};
};
