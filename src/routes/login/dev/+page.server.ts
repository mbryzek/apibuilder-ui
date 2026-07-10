import type { PageServerLoad } from './$types';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';
import { redirectWithFlash } from '$lib/server/flash';
import type { TenantSession } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async ({ cookies }) => {
  const client = clients();
  const response = await handleApiCall<TenantSession>(() =>
    client.platform.getTenantSession(config.tenantId, { headers: getSessionHeaders('dev') })
  );

  if ('data' in response && response.data) {
    cookies.set(SESSION_COOKIE, response.data.session.id, {
      path: '/',
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365
    });
    redirectWithFlash('/', 'Logged in as dev');
  }

  redirectWithFlash('/login', 'Developer login not enabled', 'error');
};
