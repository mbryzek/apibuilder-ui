import { redirect, type Cookies } from '@sveltejs/kit';
import { config } from '$lib/config';
import { FLASH_TYPES, type Flash, type FlashType } from '$lib/flash';

export type { Flash, FlashType };

/**
 * The flash travels in a short-lived httpOnly cookie, NOT in the redirect URL.
 *
 * A query param is caller-supplied by construction: nothing ties `?flash=...` to a redirect this
 * server issued, so any link — `https://<app>/?flash=<any+sentence>&flash_type=error` — renders an
 * attacker's sentence as the app's own toast, on the app's own origin, to a signed-in user. Svelte
 * escapes the text so it is not XSS; it is a phishing surface, and the app chrome is what lends the
 * sentence its credibility. A cookie the browser cannot read or forge is the message the server
 * actually sent, and it is consumed once.
 *
 * Carrying it out-of-band also means the redirect target is emitted verbatim, so a `#hash` survives
 * (`safeRedirectPath` deliberately preserves one) and the URL the user lands on is the URL they
 * keep — no client-side rewrite to strip params back out.
 */
export const FLASH_COOKIE = 'flash';

/** Long enough to survive the redirect round-trip, short enough that a stale one cannot surface. */
const FLASH_MAX_AGE_SECONDS = 30;

export function setFlash(cookies: Cookies, message: string, type: FlashType = 'success'): void {
  cookies.set(FLASH_COOKIE, JSON.stringify({ message, type } satisfies Flash), {
    path: '/',
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: FLASH_MAX_AGE_SECONDS
  });
}

/**
 * Read the pending flash and clear it, so a message is shown exactly once.
 *
 * The cookie is httpOnly and same-site, but it is still request input, so the payload is validated
 * rather than trusted: anything that is not a `{ message, type }` object with a known variant is
 * dropped. That keeps a malformed or hand-set cookie from rendering as a toast or from throwing
 * inside the root layout load, which would take every page down.
 */
export function takeFlash(cookies: Cookies): Flash | undefined {
  const raw = cookies.get(FLASH_COOKIE);
  if (!raw) {
    return undefined;
  }

  cookies.delete(FLASH_COOKIE, { path: '/' });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (!parsed || typeof parsed !== 'object') {
    return undefined;
  }

  const { message, type } = parsed as Record<string, unknown>;
  if (typeof message !== 'string' || !message) {
    return undefined;
  }

  return { message, type: FLASH_TYPES.includes(type as FlashType) ? (type as FlashType) : 'success' };
}

/**
 * Throw a SvelteKit redirect (303 by default) to `path`, with a flash message attached to the
 * response as a cookie. Never returns.
 *
 * `path` must be an absolute, same-origin path (starts with `/`); it is emitted unchanged.
 */
export function redirectWithFlash(
  cookies: Cookies,
  path: string,
  message: string,
  type: FlashType = 'success',
  status: 302 | 303 = 303
): never {
  setFlash(cookies, message, type);
  throw redirect(status, path);
}
