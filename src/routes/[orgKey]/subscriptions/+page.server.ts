import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, memberClient } from '$lib/server/auth';
import { requiredEnum } from '$lib/server/form';
import type { Subscription } from '$generated/com-bryzek-apibuilder';
import { Publication } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);

  const response = await handleApiCall<Subscription[]>(() =>
    apiBuilderClient({ headers }).getSubscriptions({ limit: 100, offset: 0, organizationKey: event.params.orgKey, userId: session.user.id })
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
   * carries only the publication, which is validated against the enum. The toggle therefore flips
   * whatever the server actually has rather than what the browser last saw.
   *
   * Membership is what it requires: the platform resolves the org under the caller's own
   * authorization, so only a member can subscribe to it in the first place.
   */
  toggle: async ({ request, params, locals }) => {
    const { session, client } = await memberClient(locals, params.orgKey);
    const formData = await request.formData();
    const publication = requiredEnum(formData, 'publication', Object.values(Publication));

    if (!publication) {
      return fail(400, { errors: [{ message: 'Invalid publication' }] });
    }

    const existing = await handleApiCall<Subscription[]>(() =>
      client.getSubscriptions({
        organizationKey: params.orgKey,
        userId: session.user.id,
        publication,
        limit: 100,
        offset: 0
      })
    );
    if (isApiError(existing)) {
      return actionFail(existing);
    }

    if (existing.data.length > 0) {
      for (const subscription of existing.data) {
        const response = await handleApiCall<void>(() => client.deleteSubscriptionById(subscription.id));
        if (isApiError(response)) {
          return actionFail(response);
        }
      }
    } else {
      const response = await handleApiCall<Subscription>(() =>
        client.createSubscription({
          body: {
            organization_key: params.orgKey,
            user_id: session.user.id,
            publication
          }
        })
      );
      if (isApiError(response)) {
        return actionFail(response);
      }
    }

    return { success: true };
  }
};
