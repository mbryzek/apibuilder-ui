import type { LayoutServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, dataOrThrow, loadErrorFrom } from '$lib/api/load-error';
import { assertSafePathParams } from '$lib/server/path-params';
import type { Version, Watch } from '$generated/com-bryzek-apibuilder';

export const load: LayoutServerLoad = async ({ params, locals }) => {
  // getVersionByVersion interpolates orgKey/appKey/version into the upstream path unencoded.
  // Layout and page loads run in parallel, so each loader that makes such a call has to guard
  // its own — a check here alone would not stop a child's request from going out.
  assertSafePathParams(params);
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient();

  const versionResponse = await handleApiCall<Version>(() =>
    client.getVersionByVersion({ orgKey: params.orgKey, appKey: params.appKey, version: params.version, headers })
  );

  const version = dataOrThrow(versionResponse, 'Version not found');

  const watchResponse = locals.session
    ? await handleApiCall<Watch[]>(() =>
        client.getWatches({
          userId: locals.session!.user.id,
          organizationKey: params.orgKey,
          applicationKey: params.appKey,
          limit: 100,
          offset: 0,
          headers
        })
      )
    : null;

  const watchData = watchResponse ? dataOr(watchResponse, []) : [];
  const currentWatch = watchData.length > 0 ? watchData[0] : null;

  return {
    version,
    service: version.service,
    isWatching: currentWatch !== null,
    watchGuid: currentWatch?.id,
    // Without this the toggle renders "not watching" for a lookup that never
    // answered, and pressing it would file a second watch on the same application.
    watchLoadError: loadErrorFrom(watchResponse)
  };
};
