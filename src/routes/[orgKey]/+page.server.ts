import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Application, MembershipRequest } from '$generated/com-bryzek-apibuilder';

const LIMIT = 25;

export const load: PageServerLoad = async ({ params, parent, locals, url }) => {
	const { isAdmin } = await parent();
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};
	const offset = Number(url.searchParams.get('offset') || '0');

	const appsResponse = await handleApiCall<Application[]>(
		() => apiBuilderClient().getApplications({ orgKey: params.orgKey, hasVersion: true, limit: LIMIT, offset, headers }),
	);

	const applications = 'data' in appsResponse ? appsResponse.data : [];

	let hasPendingRequests = false;
	if (isAdmin && locals.session) {
		const requestsResponse = await handleApiCall<MembershipRequest[]>(
			() => apiBuilderClient().getMembershipRequests({ orgKey: params.orgKey, limit: 1, offset: 0, headers }),
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
