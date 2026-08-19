import { type Handle } from '@sveltejs/kit';
import { clients, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { isUnavailable } from '$lib/api/api-message';
import { SESSION_COOKIE, config } from '$lib/config';
import { clearSessionCookie } from '$lib/server/session';
import type { TenantSession } from '$generated/com-bryzek-platform';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(SESSION_COOKIE) || undefined;

  if (sessionId) {
    const client = clients({ headers: getSessionHeaders(sessionId) });
    const response = await handleApiCall<TenantSession>(() => client.platform.getTenantSession(config.tenantId), {
      onUnauthorized: () => {
        // Stale/invalid cookie: clear it and treat the request as anonymous. Do NOT
        // force a global redirect to /login here -- that would bounce users off public
        // routes (e.g. /doc/*, home, /generators) just because they carry an expired
        // cookie. Protected routes enforce auth in their own load via requireAuth(),
        // which produces the correct /login?redirect=<path> only when actually needed.
        clearSessionCookie(event.cookies);
        event.locals.session = undefined;
      }
    });

    if ('data' in response && response.data) {
      event.locals.session = {
        id: sessionId,
        user: response.data.user
      };
    } else {
      event.locals.session = undefined;
      // A 401 above already cleared the cookie and genuinely means "signed out". Every other
      // failure -- 5xx, a rate limit, a dropped connection -- means we do not KNOW who this is,
      // and reporting that as "not signed in" bounced signed-in users to /login with their form
      // input lost, while their cookie was still perfectly valid. Record the difference; the
      // guards in lib/server/auth.ts decide what to do with it.
      event.locals.sessionUnavailable = isApiError(response) && isUnavailable(response.status);
    }
  } else {
    event.locals.session = undefined;
  }

  const res = await resolve(event);

  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (config.isProduction) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // The page policy is NOT set here -- it comes from `kit.csp` in svelte.config.js, because only
  // SvelteKit can nonce the hydration bootstrap it injects. Setting Content-Security-Policy
  // unconditionally here would overwrite that nonced header and take the whole app down, which is
  // the trap the previous hand-built version worked around by allowing 'unsafe-inline'.
  //
  // What SvelteKit does not cover is everything it did not render: the +server.ts endpoints
  // (service.json, original, the generator download, the type example). Those return JSON or plain
  // text and load no subresources at all, so they get the strictest policy there is.
  if (!res.headers.has('Content-Security-Policy')) {
    res.headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  }

  return res;
};
