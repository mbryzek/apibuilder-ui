import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import type { Organization, Membership } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) {
    const headers = getSessionHeaders(locals.session.id);
    const membershipsResponse = await handleApiCall<Membership[]>(() =>
      apiBuilderClient({ headers }).getMemberships({ userId: locals.session!.user.id, limit: 100, offset: 0 })
    );
    const loadError = loadErrorFrom(membershipsResponse);
    const myOrgs: Organization[] = dataOr(membershipsResponse, []).map((m) => m.organization);

    // Only route off the org list when we actually know what it is. On a failure the
    // list is empty because the call failed, and redirecting would send a member of
    // several organizations to "create your first organization".
    if (!loadError) {
      if (myOrgs.length === 0) {
        throw redirect(303, '/org/create');
      }
      if (myOrgs.length === 1) {
        const org = myOrgs[0];
        if (org) throw redirect(303, '/' + org.key);
      }
    }

    return { myOrgs, loadError };
  }

  const publicOrgsResponse = await handleApiCall<Organization[]>(() => apiBuilderClient().getOrganizations({ limit: 25, offset: 0 }));

  return {
    myOrgs: [] as Organization[],
    publicOrgs: dataOr(publicOrgsResponse, []),
    loadError: loadErrorFrom(publicOrgsResponse)
  };
};
