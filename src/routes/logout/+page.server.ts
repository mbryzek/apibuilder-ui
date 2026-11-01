import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { clearSessionCookie } from '#lib/server/session.ts';
import { platformClient, getSessionHeaders } from '#lib/api/clients.ts';
import { handleApiCall } from '#lib/api/error-handler.ts';
import { SESSION_COOKIE, config } from '#lib/config.ts';

/**
 * `GET /logout` must not log anyone out. SvelteKit's origin check only guards POST form actions, so
 * a state-changing GET here is reachable from any third-party page (`<img src="…/logout">`). The
 * only logout entry points in the app are the POST form in `AccountMenu.svelte`.
 */
export const load: PageServerLoad = async () => {
  throw redirect(303, '/');
};

export const actions: Actions = {
  default: async ({ cookies, locals }) => {
    // Revoke the session on the platform, not just in the browser. The cookie is minted with a
    // one-year maxAge, so without this any copy of its value (shared machine, proxy log, backup)
    // keeps authenticating for a year after the user "logs out".
    //
    // Revoke whatever the cookie holds, not only a session the hook resolved: when the lookup got
    // no answer (a rate limit, an outage) `locals.session` is absent while the cookie is still a
    // live session, and skipping revocation then cleared the browser's copy alone.
    const sessionId = locals.session?.id ?? cookies.get(SESSION_COOKIE);
    if (sessionId) {
      await handleApiCall<void>(() => platformClient({ headers: getSessionHeaders(sessionId) }).deleteTenantSession(config.tenantId));
    }

    // Always clear the cookie, even if revocation failed — the user asked to be logged out.
    clearSessionCookie(cookies);
    throw redirect(303, '/logged-out');
  }
};
