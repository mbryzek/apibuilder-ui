import { ctx, later, type CallContext } from '#lib/telemetry/context.ts';
import type { LayoutServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders, type ClientOptions } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, dataOrThrow, loadErrorFrom, type LoadError } from '#lib/api/load-error.ts';
import { loadAllGenerators } from '#lib/server/generators.ts';
import { assertSafePathParams } from '#lib/server/path-params.ts';
import type { Version } from '#generated/com-bryzek-apibuilder.ts';
import type { Generator } from '#generated/com-bryzek-apibuilder-generator.ts';

/** The sidebar's Clients section, and why it is missing when the catalog could not be read. */
export interface SidebarGenerators {
  generators: Generator[];
  // Without this the sidebar's missing Clients section reads as "no generators exist".
  loadError: LoadError | null;
}

async function loadSidebarGenerators(context: CallContext, options: ClientOptions): Promise<SidebarGenerators> {
  const response = await loadAllGenerators(context, options);
  return { generators: dataOr(response, []), loadError: loadErrorFrom(response) };
}

/**
 * The version is the one read every screen under it waits for. The generator catalog needs nothing
 * from it, so it goes out at the same time and streams as `later:generators`: the sidebar's Clients
 * section fills in after first paint rather than holding the spec behind the catalog read.
 */
export const load: LayoutServerLoad = async (event) => {
  const { params, locals } = event;
  // getVersionByVersion interpolates orgKey/appKey/version into the upstream path unencoded.
  // Layout and page loads run in parallel, so each loader that makes such a call has to guard
  // its own — a check here alone would not stop a child's request from going out.
  assertSafePathParams(params);
  const headers = getSessionHeaders(locals.session?.id);
  const client = apiBuilderClient({ headers });

  const versionRead = handleApiCall<Version>(() =>
    client.getVersionByVersion(ctx(event, 'load'), { orgKey: params.orgKey, appKey: params.appKey, version: params.version })
  );
  const generators = later(ctx(event, 'load'), 'generators', (context) => loadSidebarGenerators(context, { headers }));

  const version = dataOrThrow(await versionRead, 'Version not found');

  return { version, service: version.service, generators };
};
