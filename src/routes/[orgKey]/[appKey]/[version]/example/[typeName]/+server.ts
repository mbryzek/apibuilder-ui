import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const optionalFields = url.searchParams.get('optional_fields') === 'true';

	const response = await handleApiCall<unknown>(
		() => locals.apiClient.getVersionExampleByApplicationKeyAndVersionAndTypeName({
			orgKey: params.orgKey,
			applicationKey: params.appKey,
			version: params.version,
			typeName: params.typeName,
			optionalFields,
			headers,
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
