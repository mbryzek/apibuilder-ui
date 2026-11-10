import { ctx } from '#lib/telemetry/context.ts';
import type { PageServerLoad } from './$types';
import { generatorClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOrThrow } from '#lib/api/load-error.ts';
import type { Generator } from '#generated/com-bryzek-apibuilder-generator.ts';

export const load: PageServerLoad = async (event) => {
  const { params, locals } = event;
  const headers = getSessionHeaders(locals.session?.id);

  const response = await handleApiCall<Generator>(() => generatorClient({ headers }).getGeneratorByKey(ctx(event, 'load'), params.key));

  return { generator: dataOrThrow(response, 'Generator not found') };
};
