import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Code } from '$generated/com-bryzek-bryzek-apibuilder-v0';

export const GET: RequestHandler = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const response = await handleApiCall<Code>(
		() => apiBuilderClient().getCode({ orgKey: params.orgKey, appKey: params.appKey, version: params.version, generatorKey: params.generatorKey, headers }),
	);

	if (!('data' in response) || response.data.files.length === 0) {
		throw error(404, 'No generated files found');
	}

	const files = response.data.files;

	// For single file, return it directly
	if (files.length === 1) {
		const file = files[0]!;
		const filename = file.dir ? `${file.dir}/${file.name}` : file.name;
		return new Response(file.contents, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Content-Disposition': `attachment; filename="${filename}"`,
			},
		});
	}

	// For multiple files, concatenate with headers
	const parts: string[] = [];
	for (const file of files) {
		const path = file.dir ? `${file.dir}/${file.name}` : file.name;
		parts.push(`// ===== ${path} =====\n\n${file.contents}`);
	}

	const combined = parts.join('\n\n');
	return new Response(combined, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Content-Disposition': `attachment; filename="${params.appKey}-${params.generatorKey}.txt"`,
		},
	});
};
