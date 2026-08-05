import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireMemberForAction } from '$lib/server/auth';
import type { Subscription } from '$generated/com-bryzek-apibuilder';
import { Publication } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);

  const response = await handleApiCall<Subscription[]>(() =>
    apiBuilderClient().getSubscriptions({ limit: 100, offset: 0, organizationKey: event.params.orgKey, userId: session.user.id, headers })
  );

  return {
    subscriptions: dataOr(response, []),
    loadError: loadErrorFrom(response)
  };
};

export const actions: Actions = {
  /**
   * Subscribe or unsubscribe the caller from one publication of this org.
   *
   * The subscription to remove is resolved from the caller's own subscriptions to *this* org
   * rather than taken from a `subscription_id` form field, so there is no id to forge: the form
   * now carries only the publication, which is validated against the enum. The page was already
   * deriving that id from the publication client-side, so nothing is lost — and the toggle now
   * flips whatever the server actually has rather than what the browser last saw, which is what
   * a toggle should do.
   *
   * `requireMemberForAction` replaces the bare `requireAuthForAction` to match the sibling
   * `[orgKey]` actions and the upstream rule: the platform resolves the org under the caller's
   * own authorization, so only a member can subscribe to it in the first place.
   */
  toggle: async ({ request, params, locals }) => {
    const session = await requireMemberForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const publication = formData.get('publication');

    if (!publication || typeof publication !== 'string' || !Object.values(Publication).includes(publication as Publication)) {
      return fail(400, { errors: [{ message: 'Invalid publication' }] });
    }

    const existing = await handleApiCall<Subscription[]>(() =>
      apiBuilderClient().getSubscriptions({
        organizationKey: params.orgKey,
        userId: session.user.id,
        publication: publication as Publication,
        limit: 100,
        offset: 0,
        headers
      })
    );
    if ('errors' in existing) {
      return fail(400, { errors: existing.errors });
    }

    if (existing.data.length > 0) {
      for (const subscription of existing.data) {
        const response = await handleApiCall<void>(() => apiBuilderClient().deleteSubscriptionById(subscription.id, { headers }));
        if ('errors' in response) {
          return fail(400, { errors: response.errors });
        }
      }
    } else {
      const response = await handleApiCall<Subscription>(() =>
        apiBuilderClient().createSubscription({
          body: {
            organization_key: params.orgKey,
            user_id: session.user.id,
            publication: publication as Publication
          },
          headers
        })
      );
      if ('errors' in response) {
        return fail(400, { errors: response.errors });
      }
    }

    return { success: true };
  }
};
