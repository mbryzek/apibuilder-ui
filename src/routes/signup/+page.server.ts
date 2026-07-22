import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { config } from '$lib/config';
import { redirectWithFlash } from '$lib/server/flash';
import { setSessionCookie } from '$lib/server/session';
import { isTenantSession, type SessionState } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) {
    throw redirect(303, '/');
  }
  return {
    githubClientId: config.githubClientId,
    appBaseUrl: config.appBaseUrl
  };
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (!email || !password) {
      return fail(400, { errors: [{ message: 'Email and password are required' }], email, name });
    }

    const person: Record<string, string> = { email };
    if (name) person['name'] = name;

    const client = clients();
    const response = await handleApiCall<SessionState>(() =>
      client.platform.createTenantSessionSignups({
        tenantId: config.tenantId,
        body: { user: { person }, password },
        headers: getSessionHeaders()
      })
    );

    if ('errors' in response) {
      return fail(400, { errors: response.errors, email, name });
    }

    if ('data' in response && response.data && isTenantSession(response.data)) {
      setSessionCookie(cookies, response.data.session.id);
      redirectWithFlash('/org/create', 'Welcome to API Builder! Create your first organization to get started.');
    }

    redirectWithFlash('/login', 'Account created! Please sign in.');
  }
};
