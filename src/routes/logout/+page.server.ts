import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { clearSessionCookie } from '$lib/server/session';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { config } from '$lib/config';

/**
 * `GET /logout` must not log anyone out. SvelteKit's origin check only guards POST form actions, so
 * a state-changing GET here is reachable from any third-party page (`<img src="…/logout">`). The
 * only logout entry points in the app are the POST forms in `Header.svelte`.
 */
export const load: PageServerLoad = async () => {
  throw redirect(303, '/');
};

export const actions: Actions = {
  default: async ({ cookies, locals }) => {
    // Revoke the session on the platform, not just in the browser. The cookie is minted with a
    // one-year maxAge, so without this any copy of its value (shared machine, proxy log, backup)
    // keeps authenticating for a year after the user "logs out".
    if (locals.session) {
      await handleApiCall<void>(() =>
        platformClient({ headers: getSessionHeaders(locals.session!.id) }).deleteTenantSession(config.tenantId)
      );
    }

    // Always clear the cookie, even if revocation failed — the user asked to be logged out.
    clearSessionCookie(cookies);
    throw redirect(303, '/logged-out');
  }
};
