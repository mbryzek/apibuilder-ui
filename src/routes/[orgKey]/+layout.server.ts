import { ctx } from '#lib/telemetry/context.ts';
import type { LayoutServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, dataOrThrow, loadErrorFrom, type LoadError } from '#lib/api/load-error.ts';
import type { Organization, Membership } from '#generated/com-bryzek-apibuilder.ts';
import { MembershipRole } from '#generated/com-bryzek-apibuilder.ts';

export const load: LayoutServerLoad = async (event) => {
  const { params, locals } = event;
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient({ headers });

  // Both reads go out together: the memberships read needs only the URL's key, never the organization,
  // so neither waits on the other.
  const orgRead = handleApiCall<Organization>(() => client.getOrganizationByKey(ctx(event, 'load'), params.orgKey));
  const session = locals.session;
  const membershipsRead = session
    ? handleApiCall<Membership[]>(() =>
        client.getMemberships(ctx(event, 'load'), { orgKey: params.orgKey, userId: session.user.id, limit: 25, offset: 0 })
      )
    : null;
  const org = dataOrThrow(await orgRead, 'Organization not found');

  let isMember = false;
  let isAdmin = false;
  // Named apart from the pages' `loadError` on purpose: page data is merged over
  // layout data, so a shared key would silently drop whichever one the page also set.
  let membershipLoadError: LoadError | null = null;

  if (membershipsRead) {
    const membershipsResponse = await membershipsRead;
    // Falling back to "not a member" would tell a member they need to request access.
    membershipLoadError = loadErrorFrom(membershipsResponse);
    const memberships = dataOr(membershipsResponse, []);
    isMember = memberships.length > 0;
    isAdmin = memberships.some((m) => m.role === MembershipRole.Admin);
  }

  return { org, isMember, isAdmin, membershipLoadError };
};
