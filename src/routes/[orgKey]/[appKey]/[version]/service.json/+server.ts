import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getVersion, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Version } from '$generated/types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<Version>(
		() => getVersion(params.orgKey, params.appKey, params.version, headers),
	);

	if (!('data' in response)) {
		throw error(404, 'Version not found');
	}

	const serviceJson = JSON.stringify(response.data.service, null, 2);

	return new Response(serviceJson, {
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename="${params.appKey}-${params.version}-service.json"`,
		},
	});
};
