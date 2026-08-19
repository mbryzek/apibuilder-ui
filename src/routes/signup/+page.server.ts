import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { config } from '$lib/config';
import { completeSession } from '$lib/server/auth-completion';
import { optionalString, requiredSecret, requiredString } from '$lib/server/form';
import type { SessionState } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) {
    throw redirect(303, '/');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = requiredString(formData, 'email');
    const password = requiredSecret(formData, 'password');
    const name = optionalString(formData, 'name');

    if (!email || !password) {
      return fail(400, { errors: [{ message: 'Email and password are required' }], email, name });
    }

    const person: Record<string, string> = { email };
    if (name) person['name'] = name;

    const client = clients({ headers: getSessionHeaders() });
    const response = await handleApiCall<SessionState>(() =>
      client.platform.createTenantSessionSignups({
        tenantId: config.tenantId,
        body: { user: { person }, password }
      })
    );

    // Handled here rather than in completeSession so the submitted values survive the round-trip
    // and the form can be re-rendered with them.
    if (isApiError(response)) {
      return actionFail(response, { email, name });
    }

    return completeSession(cookies, response, '/org/create', 'Welcome to API Builder! Create your first organization to get started.');
  }
};
