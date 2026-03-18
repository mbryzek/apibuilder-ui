import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Organization, Membership } from '$generated/com-bryzek-bryzek-apibuilder-v0';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		const headers = getSessionHeaders(locals.session.id);
		const membershipsResponse = await handleApiCall<Membership[]>(
			() => apiBuilderClient().getMemberships({ userId: locals.session!.user.id, limit: 100, offset: 0, headers }),
		);
		const myOrgs: Organization[] = 'data' in membershipsResponse
			? membershipsResponse.data.map((m) => m.organization)
			: [];

		if (myOrgs.length === 0) {
			throw redirect(303, '/org/create');
		}
		if (myOrgs.length === 1) {
			const org = myOrgs[0];
			if (org) throw redirect(303, '/' + org.key);
		}

		return { myOrgs };
	}

	const publicOrgsResponse = await handleApiCall<Organization[]>(
		() => apiBuilderClient().getOrganizations({ limit: 25, offset: 0 }),
	);

	return {
		myOrgs: [] as Organization[],
		publicOrgs: 'data' in publicOrgsResponse ? publicOrgsResponse.data : [],
	};
};
