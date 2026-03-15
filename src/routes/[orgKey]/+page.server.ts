import type { PageServerLoad } from './$types';
import { getApplications, getMembershipRequests } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Application, MembershipRequest } from '$generated/types';

const LIMIT = 25;

export const load: PageServerLoad = async ({ params, parent, locals, url }) => {
	const { isAdmin } = await parent();
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const offset = Number(url.searchParams.get('offset') || '0');

	const appsResponse = await handleApiCall<Application[]>(
		() => getApplications(params.orgKey, headers, { has_version: true, limit: LIMIT, offset }),
	);

	const applications = 'data' in appsResponse ? appsResponse.data : [];

	let hasPendingRequests = false;
	if (isAdmin && locals.session) {
		const requestsResponse = await handleApiCall<MembershipRequest[]>(
			() => getMembershipRequests(headers, { org_key: params.orgKey, limit: 1 }),
		);
		if ('data' in requestsResponse) {
			hasPendingRequests = requestsResponse.data.length > 0;
		}
	}

	return {
		applications,
		offset,
		hasMore: applications.length >= LIMIT,
		hasPendingRequests,
	};
};
