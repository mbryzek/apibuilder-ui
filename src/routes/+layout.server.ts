import type { LayoutServerLoad } from './$types';

/**
 * Expose only the user to the client. `locals.session.id` is the credential we send as the
 * `session_id` header, and anything returned here is serialized into the SSR HTML and into every
 * `__data.json` navigation response — so returning the session whole would hand the credential to
 * any script running on the page.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
  return { session: locals.session ? { user: locals.session.user } : undefined };
};
