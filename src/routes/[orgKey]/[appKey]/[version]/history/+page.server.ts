import type { PageServerLoad } from './$types';
import { getChanges, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Change } from '$generated/types';

const LIMIT = 25;

export const load: PageServerLoad = async ({ url, locals, parent }) => {
	const { version } = await parent();
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const offset = Number(url.searchParams.get('offset') || '0');
	const orgKey = version.organization.key;
	const appKey = version.application.key;

	const response = await handleApiCall<Change[]>(
		() => getChanges(headers, { org_key: orgKey, application_key: appKey, limit: LIMIT, offset }),
	);

	const changes = 'data' in response ? response.data : [];

	return {
		changes,
		offset,
		hasMore: changes.length >= LIMIT,
		orgKey,
		appKey,
		versionName: version.version,
	};
};
