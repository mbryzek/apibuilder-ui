import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getOrganizationByKey, getMemberships, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import type { Organization, Membership } from '$generated/types';
import { MembershipRole } from '$generated/types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

	const orgResponse = await handleApiCall<Organization>(
		() => getOrganizationByKey(params.orgKey, headers),
	);

	if (!('data' in orgResponse)) {
		throw error(404, 'Organization not found');
	}

	let isMember = false;
	let isAdmin = false;

	if (locals.session) {
		const membershipsResponse = await handleApiCall<Membership[]>(
			() => getMemberships({ org_key: params.orgKey, user_guid: locals.session!.user.id }, headers),
		);
		if ('data' in membershipsResponse) {
			isMember = membershipsResponse.data.length > 0;
			isAdmin = membershipsResponse.data.some((m) => m.role === MembershipRole.Admin);
		}
	}

	return { org: orgResponse.data, isMember, isAdmin };
};
