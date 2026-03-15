import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Organization, Membership } from '$generated/com-bryzek-bryzek-apibuilder-v0';

export const load: PageServerLoad = async ({ locals }) => {
	const publicOrgsResponse = await handleApiCall<Organization[]>(
		() => apiBuilderClient().getOrganizations({ limit: 25, offset: 0 }),
	);

	let myOrgs: Organization[] = [];
	if (locals.session) {
		const headers = getSessionHeaders(locals.session.id);
		const membershipsResponse = await handleApiCall<Membership[]>(
			() => apiBuilderClient().getMemberships({ userGuid: locals.session!.user.id, limit: 25, offset: 0, headers }),
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
