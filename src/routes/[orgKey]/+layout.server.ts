import type { LayoutServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, dataOrThrow, loadErrorFrom, type LoadError } from '$lib/api/load-error';
import type { Organization, Membership } from '$generated/com-bryzek-apibuilder';
import { MembershipRole } from '$generated/com-bryzek-apibuilder';

export const load: LayoutServerLoad = async ({ params, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);

  const orgResponse = await handleApiCall<Organization>(() => apiBuilderClient().getOrganizationByKey(params.orgKey, { headers }));
  const org = dataOrThrow(orgResponse, 'Organization not found');

  let isMember = false;
  let isAdmin = false;
  // Named apart from the pages' `loadError` on purpose: page data is merged over
  // layout data, so a shared key would silently drop whichever one the page also set.
  let membershipLoadError: LoadError | null = null;

  if (locals.session) {
    const membershipsResponse = await handleApiCall<Membership[]>(() =>
      apiBuilderClient().getMemberships({ orgKey: params.orgKey, userId: locals.session!.user.id, limit: 25, offset: 0, headers })
    );
    // Falling back to "not a member" would tell a member they need to request access.
    membershipLoadError = loadErrorFrom(membershipsResponse);
    const memberships = dataOr(membershipsResponse, []);
    isMember = memberships.length > 0;
    isAdmin = memberships.some((m) => m.role === MembershipRole.Admin);
  }

  return { org, isMember, isAdmin, membershipLoadError };
};
