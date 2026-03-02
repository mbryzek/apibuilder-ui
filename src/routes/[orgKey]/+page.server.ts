import type { PageServerLoad } from './$types';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Application, MembershipRequest } from '$generated/types';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { isAdmin } = await parent();
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const appsResponse = await handleApiCall<Application[]>(
		() => locals.apiClient.getApplications({ orgKey: params.orgKey, hasVersion: true, limit: 100, offset: 0, headers }),
	);

	let hasPendingRequests = false;
	if (isAdmin && locals.session) {
		const requestsResponse = await handleApiCall<MembershipRequest[]>(
			() => locals.apiClient.getMembershipRequests({ orgKey: params.orgKey, limit: 1, offset: 0, headers }),
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
