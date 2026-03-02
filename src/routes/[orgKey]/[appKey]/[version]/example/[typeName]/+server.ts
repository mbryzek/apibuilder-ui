import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getExample, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const optionalFields = url.searchParams.get('optional_fields') === 'true';

	const response = await handleApiCall<unknown>(
		() => getExample(params.orgKey, params.appKey, params.version, params.typeName, headers, {
			optional_fields: optionalFields,
		}),
	);

	if (!('data' in response)) {
		throw error(404, 'Example not found');
	}

	return new Response(JSON.stringify(response.data, null, 2), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
};
