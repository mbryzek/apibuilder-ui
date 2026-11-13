import type { CallContext } from '#lib/telemetry/context.ts';
import { generatorClient, type ClientOptions } from '#lib/api/clients.ts';
import { handleApiCall, isApiError, type ApiResponse } from '#lib/api/error-handler.ts';
import { parameterBounds, type Generator } from '#generated/com-bryzek-apibuilder-generator.ts';

/** The ceiling `getGenerators` declares, so the whole catalog is one request until it outgrows it. */
export const GENERATOR_PAGE_SIZE = parameterBounds.getGenerators.limit.maximum;

/**
 * The whole generator catalog, every page of it: a reader looking for one client must not find it
 * missing because it sorts past the first page. A page that fails fails the whole read, so a list
 * cut short never stands in for the catalog.
 */
export async function loadAllGenerators(context: CallContext, options: ClientOptions): Promise<ApiResponse<Generator[]>> {
  const client = generatorClient(options);
  const generators: Generator[] = [];

  for (;;) {
    const offset = generators.length;
    const response = await handleApiCall<Generator[]>(() => client.getGenerators(context, { limit: GENERATOR_PAGE_SIZE, offset }));
    if (isApiError(response)) {
      return response;
    }
    generators.push(...response.data);
    if (response.data.length < GENERATOR_PAGE_SIZE) {
      return { ...response, data: generators };
    }
  }
}
