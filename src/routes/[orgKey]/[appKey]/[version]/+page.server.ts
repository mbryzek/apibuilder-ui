import { ctx, later, type CallContext } from '#lib/telemetry/context.ts';
import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall, isApiError } from '#lib/api/error-handler.ts';
import { dataOr, loadErrorFrom, type LoadError } from '#lib/api/load-error.ts';
import { actionFail } from '#lib/api/action-error.ts';
import { requireAuthForAction, memberClient } from '#lib/server/auth.ts';
import { assertSafePathParams } from '#lib/server/path-params.ts';
import { redirectWithFlash } from '#lib/server/flash.ts';
import type { Watch } from '#generated/com-bryzek-apibuilder.ts';

/** Whether the signed-in reader watches this application, and why the toggle is unavailable when that is unknown. */
export interface WatchState {
  isWatching: boolean;
  // Without this the toggle renders "not watching" for a lookup that never
  // answered, and pressing it would file a second watch on the same application.
  loadError: LoadError | null;
}

async function loadWatch(context: CallContext, sessionId: string, userId: string, orgKey: string, appKey: string): Promise<WatchState> {
  const client = apiBuilderClient({ headers: getSessionHeaders(sessionId) });
  const response = await handleApiCall<Watch[]>(() =>
    client.getWatches(context, { userId, organizationKey: orgKey, applicationKey: appKey, limit: 1, offset: 0 })
  );
  return { isWatching: dataOr(response, []).length > 0, loadError: loadErrorFrom(response) };
}

/**
 * The spec itself comes from the layout. The watch toggle is this page's alone, so its read lives
 * here rather than in the layout every screen under the version runs, and streams as `later:watch`:
 * the spec never waits on it.
 */
export const load: PageServerLoad = async (event) => {
  const { params, locals } = event;
  const session = locals.session;
  return {
    watch: session
      ? later(ctx(event, 'load'), 'watch', (context) => loadWatch(context, session.id, session.user.id, params.orgKey, params.appKey))
      : undefined
  };
};

export const actions: Actions = {
  watch: async (event) => {
    const { params, locals } = event;
    // `requireAuthForAction` authorizes a session and validates nothing about the route, and this
    // action reflects `params.orgKey` into the redirect below. The member/admin guards run this
    // check themselves; the ones that only need a session have to run it here.
    assertSafePathParams(params);
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);
    const client = apiBuilderClient({ headers });

    const response = await handleApiCall<Watch>(() =>
      client.createWatch(ctx(event, 'form'), {
        body: {
          user_id: session.user.id,
          organization_key: params.orgKey,
          application_key: params.appKey
        }
      })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    throw redirect(303, `/${params.orgKey}/${params.appKey}/${params.version}`);
  },

  /**
   * The watch to delete is resolved from the caller's own watches for *this* application rather
   * than taken from a `watch_guid` form field, so there is no id to forge. This was the last
   * mutation in the app that passed a raw guid from the request body straight to a delete, and
   * nothing tied that guid to the session submitting it — `#lib/server/scoped-id.ts` explains the
   * shape, and watches are conspicuously absent from the list of resources it records the
   * platform as re-resolving under the caller's own authorization. `[orgKey]/subscriptions`
   * dropped its `subscription_id` field for exactly this reason; this is the same fix.
   *
   * Nothing is lost by not trusting the form: the page load already performs this very lookup to
   * decide which way to render the toggle. The toggle now unwatches whatever the server actually
   * has rather than what the browser last saw, which is what a toggle should do.
   *
   * The delete result is also checked now, matching the sibling `watch` action above. Discarding
   * it redirected as though a failed unwatch had succeeded, with nothing shown to the user.
   */
  unwatch: async (event) => {
    const { params, locals } = event;
    assertSafePathParams(params);
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);
    const client = apiBuilderClient({ headers });

    const watches = await handleApiCall<Watch[]>(() =>
      client.getWatches(ctx(event, 'form'), {
        userId: session.user.id,
        organizationKey: params.orgKey,
        applicationKey: params.appKey,
        limit: 1,
        offset: 0
      })
    );

    if (isApiError(watches)) {
      return actionFail(watches);
    }

    // Already unwatched is not a failure — fall through to the redirect and let the layout
    // re-render the toggle from what the server actually has.
    const watch = watches.data[0];
    if (watch) {
      const response = await handleApiCall<void>(() => client.deleteWatchById(ctx(event, 'form'), watch.id));

      if (isApiError(response)) {
        return actionFail(response);
      }
    }

    throw redirect(303, `/${params.orgKey}/${params.appKey}/${params.version}`);
  },

  deleteVersion: async (event) => {
    const { params, locals, cookies } = event;
    const { client } = await memberClient(ctx(event, 'form'), locals, params.orgKey);

    const response = await handleApiCall<void>(() =>
      client.deleteVersionByVersion(ctx(event, 'form'), { orgKey: params.orgKey, appKey: params.appKey, version: params.version })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(cookies, `/${params.orgKey}/${params.appKey}/latest`, 'Version deleted');
  }
};
