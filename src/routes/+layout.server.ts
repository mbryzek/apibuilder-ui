import type { LayoutServerLoad } from './$types';
import { takeFlash } from '#lib/server/flash.ts';
import { loadMyOrgs } from '#lib/server/my-orgs.ts';

/**
 * Expose only the user to the client. `locals.session.id` is the credential we send as the
 * `session_id` header, and anything returned here is serialized into the SSR HTML and into every
 * `__data.json` navigation response — so returning the session whole would hand the credential to
 * any script running on the page.
 *
 * The flash is read (and cleared) here rather than from the URL in `+layout.svelte`: only the
 * server can say whether a message was one it actually sent. See `#lib/server/flash.ts`.
 *
 * `myOrgs` is the header's organization switcher, on every signed-in page. It is returned as a
 * promise, so it streams after first paint rather than holding every page for the memberships
 * read; a form action's invalidation reloads it, which is how a newly created organization joins it.
 */
export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  return {
    session: locals.session ? { user: locals.session.user } : undefined,
    myOrgs: locals.session ? loadMyOrgs(locals.session) : undefined,
    flash: takeFlash(cookies)
  };
};
