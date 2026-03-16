import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { config } from '$lib/config';

// TODO: No generated client method for getExample — inline fetch until API spec is updated
export const GET: RequestHandler = async ({ params, locals, url }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const optionalFields = url.searchParams.get('optional_fields') === 'true';

	const queryParts: string[] = [];
	if (optionalFields) {
		queryParts.push('optional_fields=true');
	}
	const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
	const fetchUrl = `${config.apiBaseUrl}/apibuilder/${params.orgKey}/${params.appKey}/${params.version}/example/${params.typeName}${queryString}`;

	const response = await fetch(fetchUrl, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	});

	if (!response.ok) {
		throw error(404, 'Example not found');
	}

	const data = await response.json();

	return new Response(JSON.stringify(data, null, 2), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
};
