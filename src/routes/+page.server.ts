import type { PageServerLoad } from './$types';
import { getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Organization, Membership } from '$generated/types';

export const load: PageServerLoad = async ({ locals }) => {
	const publicOrgsResponse = await handleApiCall<Organization[]>(
		() => locals.apiClient.getOrganizations({ limit: 100, offset: 0, headers: {} }),
	);

	let myOrgs: Organization[] = [];
	if (locals.session) {
		const headers = getSessionHeaders(locals.session.id);
		const membershipsResponse = await handleApiCall<Membership[]>(
			() => locals.apiClient.getMemberships({ userGuid: locals.session!.user.guid, limit: 100, offset: 0, headers }),
		);
		if ('data' in membershipsResponse) {
			myOrgs = membershipsResponse.data.map((m) => m.organization);
		}
	}

	return {
		publicOrgs: 'data' in publicOrgsResponse ? publicOrgsResponse.data : [],
		myOrgs,
	};
};
