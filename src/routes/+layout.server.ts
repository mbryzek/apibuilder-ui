import type { LayoutServerLoad } from './$types';
import { takeFlash } from '$lib/server/flash';

/**
 * Expose only the user to the client. `locals.session.id` is the credential we send as the
 * `session_id` header, and anything returned here is serialized into the SSR HTML and into every
 * `__data.json` navigation response — so returning the session whole would hand the credential to
 * any script running on the page.
 *
 * The flash is read (and cleared) here rather than from the URL in `+layout.svelte`: only the
 * server can say whether a message was one it actually sent. See `$lib/server/flash`.
 */
export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  return {
    session: locals.session ? { user: locals.session.user } : undefined,
    flash: takeFlash(cookies)
  };
};
