// dry-copy: sveltekit/screen-report/view — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The screen view id, and how its two halves come to carry one.
 *
 * - A hard load: the server hook mints the id, the root layout's page data carries it to the
 *   browser, and the browser adopts it on hydration as the current view.
 * - A soft navigation: the browser mints the id in `beforeNavigate`, holds it as the current view and
 *   writes it to the same-origin session cookie `sv`. The server hook, answering that navigation's
 *   `__data.json` request, reads the cookie instead of minting, so both halves carry one id. A
 *   navigation that overtakes another overwrites the cookie, and SvelteKit cancels the overtaken
 *   one's data request.
 */

/** The cookie a soft navigation hands its view id to the server through. */
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

/** The cookie line that hands `view` to the next data request: session-scoped, same-site, every path. */
export function viewCookie(view: string, secure: boolean): string {
  return `${VIEW_COOKIE}=${view}; Path=/; SameSite=Lax${secure ? '; Secure' : ''}`;
}
// dry-copy-end
