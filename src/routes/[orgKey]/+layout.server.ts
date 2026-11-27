import { ctx } from '#lib/telemetry/context.ts';
import type { LayoutServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOrThrow, type LoadError } from '#lib/api/load-error.ts';
import type { OrganizationDetail } from '#generated/com-bryzek-apibuilder.ts';
import { MembershipRole } from '#generated/com-bryzek-apibuilder.ts';

/** The banner shown when the detail read answered without the viewer's memberships. */
const MEMBERSHIPS_UNREADABLE: LoadError = {
  status: 503,
  message: 'We could not load your memberships in this organization. Please try again.'
};

/**
 * One read carries the organization and the signed-in viewer's memberships in it: empty for a
 * signed-out viewer or a non-member, absent only when the API could not read them.
 */
export const load: LayoutServerLoad = async (event) => {
  const { params, locals } = event;
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient({ headers });

  const detail = dataOrThrow(
    await handleApiCall<OrganizationDetail>(() => client.getOrganizationDetail(ctx(event, 'load'), params.orgKey)),
    'Organization not found'
  );
  const memberships = detail.memberships;

  // Named apart from the pages' `loadError` on purpose: page data is merged over
  // layout data, so a shared key would silently drop whichever one the page also set.
  // Reading absent memberships as "not a member" would tell a member they need to request access.
  const membershipLoadError: LoadError | null = memberships === undefined ? MEMBERSHIPS_UNREADABLE : null;
  const isMember = (memberships?.length ?? 0) > 0;
  const isAdmin = memberships?.some((m) => m.role === MembershipRole.Admin) ?? false;

  return { org: detail.organization, isMember, isAdmin, membershipLoadError };
};
