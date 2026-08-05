import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import type { Change } from '$generated/com-bryzek-apibuilder';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals, parent, params }) => {
  const { version } = await parent();
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);
  const orgKey = params.orgKey;
  const appKey = params.appKey;
  const client = apiBuilderClient();

  const response = await handleApiCall<Change[]>(() =>
    client.getChanges({ orgKey, applicationKey: appKey, limit: PAGE_FETCH_LIMIT, offset, headers })
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
