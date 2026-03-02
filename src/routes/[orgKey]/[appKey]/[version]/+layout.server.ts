import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Version, ApplicationMetadataVersion, Watch } from '$generated/types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const versionResponse = await handleApiCall<Version>(
		() => locals.apiClient.getVersionByApplicationKeyAndVersion({ orgKey: params.orgKey, applicationKey: params.appKey, version: params.version, headers }),
	);

	if (!('data' in versionResponse)) {
		throw error(404, 'Version not found');
	}

	const version = versionResponse.data;

	// Fetch version list and watch status in parallel
	const [versionsResponse, watchResponse] = await Promise.all([
		handleApiCall<ApplicationMetadataVersion[]>(
			() => locals.apiClient.getApplicationsMetadataAndVersionsByApplicationKey({ orgKey: params.orgKey, applicationKey: params.appKey, limit: 100, offset: 0, headers }),
		),
		locals.session
			? handleApiCall<Watch[]>(
					() => locals.apiClient.getWatches({
						userGuid: locals.session!.user.guid,
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
		watchGuid: currentWatch?.guid,
	};
};
