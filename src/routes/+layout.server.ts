import { ctx, later } from '#lib/telemetry/context.ts';
import { screenViewId } from '#lib/telemetry/server.ts';
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
 * Because nothing waits on it, it is the screen's `later:myOrgs` part, never its load (DES-65431).
 *
 * `screenView` is the screen view the server hook opened for a hard load, handed to the browser
 * half. Absent on a request with no view, and the browser half then mints its own.
 */
export const load: LayoutServerLoad = async (event) => {
  const { locals, cookies } = event;
  const session = locals.session;
  const viewId = screenViewId(event);
  return {
    session: session ? { user: session.user } : undefined,
    myOrgs: session ? later(ctx(event, 'load'), 'myOrgs', (context) => loadMyOrgs(context, session)) : undefined,
    flash: takeFlash(cookies),
    ...(viewId ? { screenView: viewId } : {})
  };
};
