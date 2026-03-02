import type { PageServerLoad } from './$types';
import { getApplications, getMembershipRequests, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Application, MembershipRequest } from '$generated/types';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { isAdmin } = await parent();
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const appsResponse = await handleApiCall<Application[]>(
		() => getApplications(params.orgKey, headers, { has_version: true, limit: 100 }),
	);

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
		applications: 'data' in appsResponse ? appsResponse.data : [],
		hasPendingRequests,
	};
};
