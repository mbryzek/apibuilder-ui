// dry-copy: sveltekit/screen-report/view — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The screen view id, and how its two halves come to carry one.
 *
 * - A hard load: the server hook mints the id, the root layout's page data carries it to the
 *   browser, and the browser adopts it on hydration as the current view.
 * - A soft navigation: the browser mints the id in `beforeNavigate` and holds it as the view a
 *   navigation is entering. Every data request the document issues carries the document's own view
 *   in the `x-screen-view-id` header (`viewMark`), marked as a navigation (`<id>.nav`) while one is
 *   entering it. The server hook, answering that navigation's `__data.json` request, reads the
 *   header instead of minting, so both halves carry one id.
 * - A refresh (`invalidate`, `invalidateAll`, the reload after a form action): the header names the
 *   view the page shows, unmarked, so a data request carrying an unmarked id is a refresh of that
 *   view, not a new one.
 *
 * The header is per request, so each window of an app names its own view, whatever the others
 * show. The `sv` cookie is the same mark held per origin, which a browser bundle older than the
 * header still writes; the server reads it only for a request that carries no header.
 */

/** The cookie an older browser bundle hands its view id to the server through. */
export const VIEW_COOKIE = 'sv';

const VIEW_ID = /^sv_[0-9a-f]{32}$/;

/** A new view id: `sv_` and 128 random bits in hex. */
export function mintViewId(): string {
  return `sv_${crypto.randomUUID().replaceAll('-', '')}`;
}

/** Whether `value` is a view id this region minted; anything else a client sends is not adopted. */
export function isViewId(value: unknown): value is string {
  return typeof value === 'string' && VIEW_ID.test(value);
}

/** The suffix that marks the cookie's view as one a navigation is still entering. */
const NAVIGATION_MARK = '.nav';

/** A header or cookie value naming `view`, marked when a navigation is entering it; unmarked, it is the view the page shows. */
export function viewMark(view: string, navigation = false): string {
  return `${view}${navigation ? NAVIGATION_MARK : ''}`;
}

/** What a header or cookie value says: the view, and whether a navigation is entering it. Null for anything this region did not write. */
export function readViewMark(value: string | null | undefined): { view: string; navigation: boolean } | null {
  if (value === undefined || value === null) return null;
  const navigation = value.endsWith(NAVIGATION_MARK);
  const view = navigation ? value.slice(0, -NAVIGATION_MARK.length) : value;
  return isViewId(view) ? { view, navigation } : null;
}
// dry-copy-end
