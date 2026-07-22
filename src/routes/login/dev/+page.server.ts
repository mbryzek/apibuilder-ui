import type { PageServerLoad } from './$types';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { config } from '$lib/config';
import { redirectWithFlash } from '$lib/server/flash';
import { setSessionCookie } from '$lib/server/session';
import type { TenantSession } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ cookies }) => {
  const client = clients();
  const response = await handleApiCall<TenantSession>(() =>
    client.platform.getTenantSession(config.tenantId, { headers: getSessionHeaders('dev') })
  );

  if ('data' in response && response.data) {
    setSessionCookie(cookies, response.data.session.id);
    redirectWithFlash('/', 'Logged in as dev');
  }

  redirectWithFlash('/login', 'Developer login not enabled', 'error');
};
