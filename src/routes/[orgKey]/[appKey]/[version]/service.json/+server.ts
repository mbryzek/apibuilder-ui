import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Version } from '$generated/com-bryzek-apibuilder-v0';

export const GET: RequestHandler = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const client = apiBuilderClient();

	const response = await handleApiCall<Version>(
		() => client.getVersionByVersion({ orgKey: params.orgKey, appKey: params.appKey, version: params.version, headers }),
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
