import type { PageServerLoad } from './$types';
import { getOrganizations, getMemberships, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Organization, Membership } from '$generated/types';

export const load: PageServerLoad = async ({ locals }) => {
	const publicOrgsResponse = await handleApiCall<Organization[]>(
		() => getOrganizations({}, {}),
	);

	let myOrgs: Organization[] = [];
	if (locals.session) {
		const headers = getSessionHeaders(locals.session.id);
		const membershipsResponse = await handleApiCall<Membership[]>(
			() => getMemberships({ user_guid: locals.session!.user.guid }, headers),
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
