import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Organization, Membership } from '$generated/com-bryzek-apibuilder-v0';
import { MembershipRole } from '$generated/com-bryzek-apibuilder-v0';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const orgResponse = await handleApiCall<Organization>(
		() => apiBuilderClient().getOrganizationByKey(params.orgKey, { headers }),
	);

	if (!('data' in orgResponse)) {
		throw error(404, 'Organization not found');
	}

	let isMember = false;
	let isAdmin = false;

	if (locals.session) {
		const membershipsResponse = await handleApiCall<Membership[]>(
			() => apiBuilderClient().getMemberships({ orgKey: params.orgKey, userId: locals.session!.user.id, limit: 25, offset: 0, headers }),
		);
		if ('data' in membershipsResponse) {
			isMember = membershipsResponse.data.length > 0;
			isAdmin = membershipsResponse.data.some((m) => m.role === MembershipRole.Admin);
		}
	}

	return { org: orgResponse.data, isMember, isAdmin };
};
