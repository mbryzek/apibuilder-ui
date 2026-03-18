import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Code } from '$generated/com-bryzek-apibuilder-v0';

export const load: PageServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const codeResponse = await handleApiCall<Code>(
		() => apiBuilderClient().getCode({ orgKey: params.orgKey, appKey: params.appKey, version: params.version, generatorKey: params.generatorKey, headers }),
	);

	if (!('data' in codeResponse)) {
		throw error(404, 'Generated code not found');
	}

	return {
		code: codeResponse.data,
		generatorKey: params.generatorKey,
	};
};
