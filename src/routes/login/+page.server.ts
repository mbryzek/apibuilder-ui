import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '#lib/api/clients.js';
import { handleApiCall } from '#lib/api/error-handler.js';
import { config } from '#lib/config.js';
import { completeSession } from '#lib/server/auth-completion.js';
import type { SessionState } from '$generated/com-bryzek-platform';
import { safeRedirectPath } from '#lib/server/safe-redirect.js';
import { optionalString, requiredSecret, requiredString } from '#lib/server/form.js';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.session) {
    throw redirect(303, '/');
  }
  return {
    redirectTo: url.searchParams.get('redirect') || '/'
  };
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = requiredString(formData, 'email');
    const password = requiredSecret(formData, 'password');
    const redirectTo = safeRedirectPath(optionalString(formData, 'redirectTo') ?? url.searchParams.get('redirect'));

    if (!email || !password) {
      return fail(400, { errors: [{ message: 'Email and password are required' }] });
    }

    const client = clients({ headers: getSessionHeaders() });
    const response = await handleApiCall<SessionState>(() =>
      client.platform.createTenantSessionLogins({ tenantId: config.tenantId, body: { email, password } })
    );

    return completeSession(cookies, response, redirectTo, 'Welcome back!');
  }
};
