import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { config } from '$lib/config';
import { completeSession } from '$lib/server/auth-completion';
import type { SessionState } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.session) {
    throw redirect(303, '/');
  }
  return {
    redirectTo: url.searchParams.get('redirect') || '/'
  };
};

/**
 * Validate that a redirect path is same-origin (must start with '/' but not '//')
 * to prevent open-redirect attacks.
 */
function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/';
  }
  return path;
}

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = safeRedirectPath((formData.get('redirectTo') as string) || url.searchParams.get('redirect'));

    if (!email || !password) {
      return fail(400, { errors: [{ message: 'Email and password are required' }] });
    }

    const client = clients();
    const response = await handleApiCall<SessionState>(() =>
      client.platform.createTenantSessionLogins({ tenantId: config.tenantId, body: { email, password }, headers: getSessionHeaders() })
    );

    return completeSession(cookies, response, redirectTo, 'Welcome back!');
  }
};
