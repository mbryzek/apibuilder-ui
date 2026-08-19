import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { config } from '$lib/config';
import { redirectWithFlash } from '$lib/server/flash';
import { setSessionCookie } from '$lib/server/session';
import type { TenantSession } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ cookies }) => {
  // This route hands the backend the literal session id 'dev' and mints a real session cookie from
  // whatever comes back. In production that is total account impersonation if the backend ever
  // stops rejecting it — a backend invariant this repo neither states nor enforces. Do not ship the
  // route's behavior to production at all.
  if (config.isProduction) {
    throw error(404, 'Not found');
  }

  const client = clients({ headers: getSessionHeaders('dev') });
  const response = await handleApiCall<TenantSession>(() => client.platform.getTenantSession(config.tenantId));

  if ('data' in response && response.data) {
    setSessionCookie(cookies, response.data.session.id);
    redirectWithFlash('/', 'Logged in as dev');
  }

  redirectWithFlash('/login', 'Developer login not enabled', 'error');
};
