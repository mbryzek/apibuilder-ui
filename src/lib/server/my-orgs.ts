import type { CallContext } from '#lib/telemetry/context.ts';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom } from '#lib/api/load-error.ts';
import type { MyOrgs } from '#lib/my-orgs.ts';
import type { Session } from '#lib/session.ts';
import type { Membership, Organization } from '#generated/com-bryzek-apibuilder.ts';

/** Reads the member's organizations. Never rejects: a failed read is a `loadError` beside an empty list. */
export async function loadMyOrgs(context: CallContext, session: Session): Promise<MyOrgs> {
  const headers = getSessionHeaders(session.id);
  const response = await handleApiCall<Membership[]>(() =>
    apiBuilderClient({ headers }).getMemberships(context, { userId: session.user.id, limit: 100, offset: 0 })
  );
  return { orgs: distinctByKey(dataOr(response, []).map((m) => m.organization)), loadError: loadErrorFrom(response) };
}

/** A member holding two roles in one organization has two memberships of it, and it is listed once. */
function distinctByKey(orgs: Organization[]): Organization[] {
  const seen = new Set<string>();
  return orgs.filter((org) => !seen.has(org.key) && seen.add(org.key));
}
