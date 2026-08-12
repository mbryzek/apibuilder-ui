/**
 * Reduce a caller-supplied redirect target to a same-origin path, or `/`.
 *
 * This lived as a private helper in `src/routes/login/+page.server.ts`, where it could not be
 * tested directly — SvelteKit rejects any export from a `+page.server.ts` that is not one of its
 * own hooks — so the only coverage possible was end-to-end through the login action, and that
 * cannot see this function's behaviour at all (see below). It is a boundary, so it belongs beside
 * the other boundaries in `$lib/server`.
 *
 * The rule it replaces was a prefix check — starts with `/`, does not start with `//` — and it did
 * not hold. WHATWG URL parsing treats a backslash directly after the leading slash as another host
 * separator for http(s), so `/\evil.com` passed that check and `new URL('/\\evil.com', origin)`
 * resolves to `http://evil.com/`.
 *
 * Nothing exploited it, and the reason is worth writing down so the guard is not "simplified" back:
 * the one call site funnels through `redirectWithFlash` -> `buildFlashUrl`, which rebuilds the URL
 * and keeps only `pathname + search`, discarding the injected host. So this was safe by accident of
 * a helper two calls away, while the function whose entire job is to be the boundary was not one.
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
