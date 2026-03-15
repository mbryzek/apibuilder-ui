import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getVersion, getApplicationVersions, getWatches, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Version, ApplicationMetadataVersion, Watch } from '$generated/types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const versionResponse = await handleApiCall<Version>(
		() => getVersion(params.orgKey, params.appKey, params.version, headers),
	);

	if (!('data' in versionResponse)) {
		throw error(404, 'Version not found');
	}

	const version = versionResponse.data;

	// Fetch version list and watch status in parallel
	const [versionsResponse, watchResponse] = await Promise.all([
		handleApiCall<ApplicationMetadataVersion[]>(
			() => getApplicationVersions(params.orgKey, params.appKey, headers, { limit: 100 }),
		),
		locals.session
			? handleApiCall<Watch[]>(
					() => getWatches(headers, {
						user_guid: locals.session!.user.id,
						organization_key: params.orgKey,
						application_key: params.appKey,
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
		watchGuid: currentWatch?.guid,
	};
};
