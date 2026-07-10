import type { PageServerLoad } from './$types';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { redirectWithFlash } from '$lib/server/flash';

export const load: PageServerLoad = async ({ params, locals }) => {
  const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

  const response = await handleApiCall<void>(() => platformClient().updateEmailVerificationByToken(params.token, { headers }));

  if ('data' in response) {
    redirectWithFlash('/', 'Email verified');
  }

  const errorMessage = 'errors' in response ? response.errors.map((e) => e.message).join(', ') : 'Unable to verify email';

  redirectWithFlash('/', errorMessage, 'error');
};
