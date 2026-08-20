/**
 * Reduce a caller-supplied redirect target to a same-origin path, or `/`.
 *
 * It lives in `$lib/server` rather than beside the login action because SvelteKit rejects any
 * export from a `+page.server.ts` that is not one of its own hooks, so a private helper there
 * cannot be tested directly. It is a boundary, and boundaries live with the other boundaries.
 *
 * A prefix check — starts with `/`, does not start with `//` — does not hold here. WHATWG URL
 * parsing treats a backslash directly after the leading slash as another host separator for
 * http(s), so `/\evil.com` passes that check and `new URL('/\\evil.com', origin)` resolves to
 * `http://evil.com/`.
 *
 * Nothing downstream sanitizes on its behalf: `redirectWithFlash` emits the path it is given
 * verbatim, so whatever comes back from here is exactly what lands in the `Location` header. This
 * function is the boundary, and it is the only one.
 *
 * Hence resolve rather than pattern-match: parse against an opaque base and keep only the parts
 * that cannot name another origin. Anything that fails to parse, or resolves elsewhere, becomes `/`.
 */
const BASE = 'http://localhost';

export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith('/')) {
    return '/';
  }

  try {
    const resolved = new URL(path, BASE);
    if (resolved.origin !== BASE) {
      return '/';
    }
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return '/';
  }
}
