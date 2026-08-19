import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { platformClient } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { isUnavailable } from '$lib/api/api-message';
import { config } from '$lib/config';
import { requiredString } from '$lib/server/form';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = requiredString(formData, 'email');

    if (!email) {
      return fail(400, { errors: [{ message: 'Email is required' }] });
    }

    const response = await handleApiCall<void>(() =>
      platformClient().createTenantSessionPasswordAndResets({
        tenantId: config.tenantId,
        body: { email }
      })
    );

    // Whether the address exists is deliberately not disclosed: a definitive refusal (404, 409,
    // 422) collapses into the same neutral success text as a real send.
    //
    // An outage is not a definitive refusal, and reporting it as success is worse than
    // enumeration — it tells the user to go and wait for an email that was never sent, on the one
    // screen they reached because they are already locked out. `isUnavailable` draws exactly this
    // line for every other action in the app.
    if (isApiError(response) && isUnavailable(response.status)) {
      return actionFail(response);
    }

    return { success: true };
  }
};
