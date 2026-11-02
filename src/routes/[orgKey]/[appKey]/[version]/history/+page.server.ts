import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom } from '#lib/api/load-error.ts';
import { assertSafePathParams } from '#lib/server/path-params.ts';
import type { Change } from '#generated/com-bryzek-apibuilder.ts';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '#lib/pagination.ts';

export const load: PageServerLoad = async ({ url, parent, params, locals }) => {
  // getChanges goes out before the parent settles, so the layout's guard cannot stop a malformed key.
  assertSafePathParams(params);
  const headers = getSessionHeaders(locals.session?.id);
  const offset = parseOffset(url);
  const orgKey = params.orgKey;
  const appKey = params.appKey;
  const client = apiBuilderClient({ headers });

  const [{ version }, response] = await Promise.all([
    parent(),
    handleApiCall<Change[]>(() => client.getChanges({ orgKey, applicationKey: appKey, limit: PAGE_FETCH_LIMIT, offset }))
  ]);

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
