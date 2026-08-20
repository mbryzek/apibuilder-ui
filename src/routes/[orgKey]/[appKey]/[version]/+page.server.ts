import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuthForAction, memberClient } from '$lib/server/auth';
import { assertSafePathParams } from '$lib/server/path-params';
import { redirectWithFlash } from '$lib/server/flash';
import type { Watch } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async () => {
  // Data already loaded by layout
  return {};
};

export const actions: Actions = {
  watch: async ({ params, locals }) => {
    // `requireAuthForAction` authorizes a session and validates nothing about the route, and this
    // action reflects `params.orgKey` into the redirect below. The member/admin guards run this
    // check themselves; the ones that only need a session have to run it here.
    assertSafePathParams(params);
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);
    const client = apiBuilderClient({ headers });

    const response = await handleApiCall<Watch>(() =>
      client.createWatch({
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
   * nothing tied that guid to the session submitting it — `$lib/server/scoped-id` explains the
   * shape, and watches are conspicuously absent from the list of resources it records the
   * platform as re-resolving under the caller's own authorization. `[orgKey]/subscriptions`
   * dropped its `subscription_id` field for exactly this reason; this is the same fix.
   *
   * Nothing is lost by not trusting the form: the layout already performs this very lookup to
   * decide which way to render the toggle. The toggle now unwatches whatever the server actually
   * has rather than what the browser last saw, which is what a toggle should do.
   *
   * The delete result is also checked now, matching the sibling `watch` action above. Discarding
   * it redirected as though a failed unwatch had succeeded, with nothing shown to the user.
   */
  unwatch: async ({ params, locals }) => {
    assertSafePathParams(params);
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);
    const client = apiBuilderClient({ headers });

    const watches = await handleApiCall<Watch[]>(() =>
      client.getWatches({
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
      const response = await handleApiCall<void>(() => client.deleteWatchById(watch.id));

      if (isApiError(response)) {
        return actionFail(response);
      }
    }

    throw redirect(303, `/${params.orgKey}/${params.appKey}/${params.version}`);
  },

  deleteVersion: async ({ params, locals, cookies }) => {
    const { client } = await memberClient(locals, params.orgKey);

    const response = await handleApiCall<void>(() =>
      client.deleteVersionByVersion({ orgKey: params.orgKey, appKey: params.appKey, version: params.version })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(cookies, `/${params.orgKey}/${params.appKey}/latest`, 'Version deleted');
  }
};
