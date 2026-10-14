import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { platformClient } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { config } from '#lib/config.ts';
import { completeSession } from '#lib/server/auth-completion.ts';
import { requiredSecret } from '#lib/server/form.ts';
import type { SessionState } from '#generated/com-bryzek-platform.ts';

// The token stays out of the page payload: the action reads it from `params`, and nothing on the
// page renders it. Returning it would serialize a single-use credential into the hydration payload
// for no consumer.
export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request, params, cookies }) => {
    const formData = await request.formData();
    const password = requiredSecret(formData, 'password');
    const confirmPassword = requiredSecret(formData, 'confirm_password');

    if (!password) {
      return fail(400, { errors: [{ message: 'Password is required' }] });
    }

    if (password !== confirmPassword) {
      return fail(400, { errors: [{ message: 'Passwords do not match' }] });
    }

    const response = await handleApiCall<SessionState>(() =>
      platformClient().createTenantSessionPasswordAndChanges({
        tenantId: config.tenantId,
        body: { id: params.token, password }
      })
    );

    return completeSession(cookies, response, '/', 'Password reset successfully!');
  }
};
