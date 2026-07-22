import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { platformClient } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { config } from '$lib/config';
import { redirectWithFlash } from '$lib/server/flash';
import { setSessionCookie } from '$lib/server/session';
import { isTenantSession, type SessionState } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ params }) => {
  return { token: params.token };
};

export const actions: Actions = {
  default: async ({ request, params, cookies }) => {
    const formData = await request.formData();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

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

    if ('data' in response && response.data && isTenantSession(response.data)) {
      setSessionCookie(cookies, response.data.session.id);
      redirectWithFlash('/', 'Password reset successfully!');
    }

    if ('errors' in response) {
      return fail(400, { errors: response.errors });
    }

    return fail(500, { errors: [{ message: 'An unexpected error occurred' }] });
  }
};
