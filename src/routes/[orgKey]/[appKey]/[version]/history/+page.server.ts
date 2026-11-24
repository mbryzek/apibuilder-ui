import { ctx, later, type CallContext } from '#lib/telemetry/context.ts';
import type { PageServerLoad } from './$types';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom, type LoadError } from '#lib/api/load-error.ts';
import { assertSafePathParams } from '#lib/server/path-params.ts';
import type { Change } from '#generated/com-bryzek-apibuilder.ts';
import { PAGE_FETCH_LIMIT, parseOffset, toPage } from '#lib/pagination.ts';

/** One page of the application's changes, and why it is missing when the read failed. */
export interface HistoryPage {
  changes: Change[];
  offset: number;
  limit: number;
  hasMore: boolean;
  loadError: LoadError | null;
}

async function loadChanges(
  context: CallContext,
  sessionId: string | undefined,
  orgKey: string,
  appKey: string,
  offset: number
): Promise<HistoryPage> {
  const client = apiBuilderClient({ headers: getSessionHeaders(sessionId) });
  const response = await handleApiCall<Change[]>(() =>
    client.getChanges(context, { orgKey, applicationKey: appKey, limit: PAGE_FETCH_LIMIT, offset })
  );
  const { rows: changes, ...page } = toPage(dataOr(response, []), offset);
  return { changes, ...page, loadError: loadErrorFrom(response) };
}

/**
 * The layouts above already spend the screen's load on the organization, the membership and the
 * version, so the changes stream as `later:history`: the spec's frame paints first and the table
 * fills in after. The read goes out before the parent settles.
 */
export const load: PageServerLoad = async (event) => {
  const { url, parent, params, locals } = event;
  // getChanges goes out before the parent settles, so the layout's guard cannot stop a malformed key.
  assertSafePathParams(params);
  const orgKey = params.orgKey;
  const appKey = params.appKey;
  const history = later(ctx(event, 'load'), 'history', (context) =>
    loadChanges(context, locals.session?.id, orgKey, appKey, parseOffset(url))
  );
  const { version } = await parent();

  return { history, orgKey, appKey, versionName: version.version };
};
