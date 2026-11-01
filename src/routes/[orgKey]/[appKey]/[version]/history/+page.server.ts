import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom } from '#lib/api/load-error.ts';
import { requireAuth } from '#lib/server/auth.ts';
import type { Change } from '#generated/com-bryzek-apibuilder.ts';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '#lib/pagination.ts';

export const load: PageServerLoad = async (event) => {
  // A signed-out visitor reaches this version through a public application, and getChanges takes a
  // credential: the API's 401 would read as an expired session nobody ever had.
  const session = requireAuth(event);
  const { url, parent, params } = event;
  const { version } = await parent();
  const headers = getSessionHeaders(session.id);
  const offset = parseOffset(url);
  const orgKey = params.orgKey;
  const appKey = params.appKey;
  const client = apiBuilderClient({ headers });

  const response = await handleApiCall<Change[]>(() =>
    client.getChanges({ orgKey, applicationKey: appKey, limit: PAGE_FETCH_LIMIT, offset })
  );

  const { rows: changes, ...page } = toPage(dataOr(response, []), offset);

  return {
    changes,
    ...page,
    orgKey,
    appKey,
    versionName: version.version,
    loadError: loadErrorFrom(response)
  };
};
