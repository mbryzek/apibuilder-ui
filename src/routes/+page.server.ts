import type { PageServerLoad } from './$types';
import { getOrganizations, getMemberships } from '$lib/api/legacy';
import { getSessionHeaders } from '$lib/api/clients';
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
			() => getMemberships({ user_guid: locals.session!.user.id }, headers),
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
