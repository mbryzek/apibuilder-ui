import { redirect } from '@sveltejs/kit';

/**
 * Flash message variants understood by the flash reader in src/routes/+layout.svelte.
 */
export type FlashType = 'success' | 'error' | 'info';

/**
 * Build a redirect target that carries a flash message, appending the `flash` and
 * `flash_type` query params correctly even when `path` already has a query string.
 *
 * Hand-concatenating `path + '?flash=...'` breaks when `path` already contains a `?`
 * (e.g. a login redirect target like `/org/app?version=latest`), producing a malformed
 * double-`?` URL that swallows the flash and corrupts the existing params.
 *
 * `path` must be an absolute, same-origin path (starts with `/`). A dummy origin is used
 * only to parse/rebuild the query string; it is never emitted.
 */
export function buildFlashUrl(path: string, message: string, type: FlashType = 'success'): string {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set('flash', message);
  url.searchParams.set('flash_type', type);
  return url.pathname + url.search;
}

/**
 * Throw a SvelteKit redirect (303 by default) to `path` with a flash message attached.
 * Never returns.
 */
export function redirectWithFlash(path: string, message: string, type: FlashType = 'success', status: 302 | 303 = 303): never {
  throw redirect(status, buildFlashUrl(path, message, type));
}
