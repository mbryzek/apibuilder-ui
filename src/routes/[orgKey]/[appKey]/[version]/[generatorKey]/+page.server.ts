import { ctx } from '#lib/telemetry/context.ts';
import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOrThrow } from '#lib/api/load-error.ts';
import { assertSafePathParams } from '#lib/server/path-params.ts';
import type { Code } from '#generated/com-bryzek-apibuilder.ts';

export const load: PageServerLoad = async (event) => {
  const { params, locals } = event;
  // getCode interpolates all four params into the upstream path unencoded.
  assertSafePathParams(params);
  const headers = getSessionHeaders(locals.session?.id);

  const codeResponse = await handleApiCall<Code>(() =>
    apiBuilderClient({ headers }).getCode(ctx(event, 'load'), {
      orgKey: params.orgKey,
      appKey: params.appKey,
      version: params.version,
      generatorKey: params.generatorKey
    })
  );

  return {
    code: dataOrThrow(codeResponse, 'Generated code not found'),
    generatorKey: params.generatorKey
  };
};
