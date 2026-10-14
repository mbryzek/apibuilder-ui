import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { config } from '#lib/config.ts';
import { redirectWithFlash } from '#lib/server/flash.ts';
import { setSessionCookie } from '#lib/server/session.ts';
import type { TenantSession } from '#generated/com-bryzek-platform.ts';

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
    redirectWithFlash(cookies, '/', 'Logged in as dev');
  }

  redirectWithFlash(cookies, '/login', 'Developer login not enabled', 'error');
};
