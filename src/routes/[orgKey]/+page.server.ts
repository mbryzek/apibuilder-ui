import { ctx, later, type CallContext } from '#lib/telemetry/context.ts';
import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom, type LoadError } from '#lib/api/load-error.ts';
import type { Application, MembershipRequest } from '#generated/com-bryzek-apibuilder.ts';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '#lib/pagination.ts';

/** The admin's banner: whether anyone is waiting to join, and the error when that read failed. */
export interface PendingRequests {
  hasPendingRequests: boolean;
  loadError: LoadError | null;
}

type Client = ReturnType<typeof apiBuilderClient>;

async function loadPendingRequests(context: CallContext, client: Client, orgKey: string): Promise<PendingRequests> {
  const response = await handleApiCall<MembershipRequest[]>(() => client.getMembershipRequests(context, { orgKey, limit: 1, offset: 0 }));
  return { hasPendingRequests: dataOr(response, []).length > 0, loadError: loadErrorFrom(response) };
}

/**
 * The applications read goes out before the page asks its layout who the viewer is, since it needs
 * only the URL. The admin's pending-requests banner is `later:pendingRequests`, streamed after first
 * paint: the list never waits on it.
 */
export const load: PageServerLoad = async (event) => {
  const { params, parent, locals, url } = event;
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient({ headers });
  const offset = parseOffset(url);

  const appsRead = handleApiCall<Application[]>(() =>
    client.getApplications(ctx(event, 'load'), { orgKey: params.orgKey, hasVersion: true, limit: PAGE_FETCH_LIMIT, offset })
  );
  const { isAdmin } = await parent();
  const appsResponse = await appsRead;

  const { rows: applications, ...page } = toPage(dataOr(appsResponse, []), offset);

  const pendingRequests =
    isAdmin && locals.session
      ? later(ctx(event, 'load'), 'pendingRequests', (context) => loadPendingRequests(context, client, params.orgKey))
      : undefined;

  return {
    applications,
    ...page,
    pendingRequests,
    loadError: loadErrorFrom(appsResponse)
  };
};
