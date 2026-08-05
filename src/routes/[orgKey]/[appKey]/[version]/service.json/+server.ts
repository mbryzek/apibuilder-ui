import type { RequestHandler } from './$types';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOrThrow } from '$lib/api/load-error';
import { attachmentHeader } from '$lib/server/download';
import { assertSafePathParams } from '$lib/server/path-params';
import type { Version } from '$generated/com-bryzek-apibuilder';

export const GET: RequestHandler = async ({ params, locals }) => {
  assertSafePathParams(params);
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient();

  const response = await handleApiCall<Version>(() =>
    client.getVersionByVersion({ orgKey: params.orgKey, appKey: params.appKey, version: params.version, headers })
  );

  // The page on the same call already distinguishes these ([version]/+layout.server.ts:15); a flat
  // 404 here told a scripted consumer the spec was gone whenever the API was merely unreachable.
  const version = dataOrThrow(response, 'Version not found');

  const serviceJson = JSON.stringify(version.service, null, 2);

  return new Response(serviceJson, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': attachmentHeader(`${params.appKey}-${params.version}-service.json`)
    }
  });
};
