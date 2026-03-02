import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Version } from '$generated/types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<Version>(
		() => locals.apiClient.getVersionByApplicationKeyAndVersion({ orgKey: params.orgKey, applicationKey: params.appKey, version: params.version, headers }),
	);

	if (!('data' in response) || !response.data.original) {
		throw error(404, 'Original spec not found');
	}

	const original = response.data.original;
	const contentType = original.type === 'avro_idl' ? 'text/plain' : 'application/json';
	const ext = original.type === 'avro_idl' ? '.avdl' : '.json';

	return new Response(original.data, {
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${params.appKey}-${params.version}${ext}"`,
		},
	});
};
