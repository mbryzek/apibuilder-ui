import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { ApplicationMetadataVersion, Version, Watch } from '$generated/com-bryzek-apibuilder';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const client = apiBuilderClient();

	const versionResponse = await handleApiCall<Version>(
		() => client.getVersionByVersion({ orgKey: params.orgKey, appKey: params.appKey, version: params.version, headers }),
	);

	if (!('data' in versionResponse)) {
		throw error(404, 'Version not found');
	}

	const version = versionResponse.data;

	// Fetch version list and watch status in parallel
	const [versionsResponse, watchResponse] = await Promise.all([
		handleApiCall<ApplicationMetadataVersion[]>(
			() => client.getApplicationMetadataVersions({ orgKey: params.orgKey, appKey: params.appKey, limit: 100, offset: 0, headers }),
		),
		locals.session
			? handleApiCall<Watch[]>(
					() => client.getWatches({
						userId: locals.session!.user.id,
						organizationKey: params.orgKey,
						applicationKey: params.appKey,
						limit: 100,
						offset: 0,
						headers,
					}),
				)
			: Promise.resolve(null),
	]);

	const versions = 'data' in versionsResponse ? versionsResponse.data : [];
	const watchData = watchResponse && 'data' in watchResponse ? watchResponse.data : [];
	const currentWatch = watchData.length > 0 ? watchData[0] : null;

	return {
		version,
		service: version.service,
		versions,
		isWatching: currentWatch !== null,
		watchGuid: currentWatch?.id,
	};
};
