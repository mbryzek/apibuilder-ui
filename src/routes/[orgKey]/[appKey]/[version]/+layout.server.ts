import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Version, Watch } from '$generated/com-bryzek-apibuilder';

export const load: LayoutServerLoad = async ({ params, locals }) => {
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient();

  const versionResponse = await handleApiCall<Version>(() =>
    client.getVersionByVersion({ orgKey: params.orgKey, appKey: params.appKey, version: params.version, headers })
  );

  if (!('data' in versionResponse)) {
    throw error(404, 'Version not found');
  }

  const version = versionResponse.data;

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

  const watchData = watchResponse && 'data' in watchResponse ? watchResponse.data : [];
  const currentWatch = watchData.length > 0 ? watchData[0] : null;

  return {
    version,
    service: version.service,
    isWatching: currentWatch !== null,
    watchGuid: currentWatch?.id
  };
};
