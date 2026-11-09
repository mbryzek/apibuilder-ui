import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiBuilderClient } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom } from '#lib/api/load-error.ts';
import type { Organization } from '#generated/com-bryzek-apibuilder.ts';

export const load: PageServerLoad = async ({ locals, parent }) => {
  if (locals.session) {
    // The same read the header's organization switcher streams, awaited here: this page is the list.
    const { myOrgs } = await parent();
    const { orgs, loadError } = await (myOrgs ?? Promise.resolve({ orgs: [] as Organization[], loadError: null }));

    // A member of no organization has one thing to do here. Only routed when the list is known: on a
    // failure it is empty because the call failed, and a member of several organizations would be
    // sent to "create your first organization". A member of ONE organization sees the list, with
    // Create Organization beside it: sending them straight to it hid the only way to make a second.
    if (!loadError && orgs.length === 0) {
      throw redirect(303, '/org/create');
    }

    return { myOrgs: orgs, loadError };
  }

  // A signed-out visitor reads the public organizations with no credential: the platform answers
  // that read for an anonymous caller with only the organizations whose visibility is public.
  const publicOrgsResponse = await handleApiCall<Organization[]>(() => apiBuilderClient().getOrganizations({ limit: 25, offset: 0 }));

  return {
    myOrgs: [] as Organization[],
    publicOrgs: dataOr(publicOrgsResponse, []),
    loadError: loadErrorFrom(publicOrgsResponse)
  };
};
