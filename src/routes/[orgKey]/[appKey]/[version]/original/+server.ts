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
  const client = apiBuilderClient({ headers });

  const response = await handleApiCall<Version>(() =>
    client.getVersionByVersion({ orgKey: params.orgKey, appKey: params.appKey, version: params.version })
  );

  const original = dataOrThrow(response, 'Original spec not found').original;

  return new Response(original.data, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': attachmentHeader(`${params.appKey}-${params.version}.json`)
    }
  });
};
