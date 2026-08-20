import { error } from '@sveltejs/kit';

/**
 * Reject route params that would steer the upstream API request somewhere else.
 *
 * SvelteKit decodes route params before a handler sees them, so `%2F` arrives as a literal `/`
 * and `%3F` as `?` — a param is therefore free to contain a path delimiter unless something says
 * otherwise.
 *
 * It is NOT what stops that reaching the upstream API. The codegen template wraps every
 * interpolated path param — `getVersionByVersion` builds
 *
 *     `${this.baseUrl}/apibuilder/${encodeURIComponent(params.orgKey)}/...`
 *
 * (src/generated/com-bryzek-apibuilder.ts) — so a traversal travels upstream as one opaque,
 * percent-encoded segment, for every caller.
 *
 * What this guard closes is an open redirect: several actions reflect `params.orgKey` into
 * `redirect(303, `/${params.orgKey}/...`)`,
 * and SvelteKit sets `Location` verbatim, so an `orgKey` of `/evil.com` yields a scheme-relative
 * `//evil.com/...` that browsers resolve to another host. `$lib/server/auth`'s
 * `requireMemberForAction`/`requireAdminForAction` call `assertSafeSegment` for exactly this
 * reason, so an action that authorizes through one of them is covered. An action that only needs
 * a session, and a load that redirects without calling upstream at all, are not — those call
 * `assertSafePathParams` directly.
 *
 * Validating rather than encoding is deliberate: these are keys, not free text. A key that is not
 * shaped like a key is a malformed request, and saying so is more honest than quietly rewriting it
 * into a lookup that will 404 anyway.
 */

/**
 * Characters that can appear in an org key, application key or generator key.
 *
 * Verified against live data: generator keys are `[a-z0-9_]` (`play_2_x_routes`, `psql_scala`),
 * org/app keys are slug-shaped. `+` and `~` are unreserved URL characters kept for parity with the
 * version charset below. Everything that acts as a delimiter — `/ ? # % \ :` — and every control
 * or non-ASCII character is excluded.
 */
const SAFE_SEGMENT = /^[A-Za-z0-9._~+-]+$/;

/**
 * Characters that can appear in a version identifier.
 *
 * This app's `VersionIdentifier` (`com.bryzek.apibuilder.models`) is not semver — the backend
 * only ever parses the literal `latest` or an ISO-8601 date-time
 * (`VersionIdentifier.fromString` in `BryzekPlayModelComBryzekApibuilder.scala`), e.g.
 * `2026-07-22T16:44:49.201Z`. `:` has to be allowed for that `T16:44:49` timestamp portion; it is
 * safe to add because `:` is a valid `pchar` within a URL path segment (RFC 3986) — only `/` acts
 * as a path delimiter, so a colon can't be used to smuggle in an extra segment or traverse.
 * `? # % \` and control/non-ASCII characters stay excluded.
 */
const SAFE_VERSION_SEGMENT = /^[A-Za-z0-9._~+:-]+$/;

/**
 * The route params that reach the upstream URL **path**. Query-string params are encoded by the
 * generated client (`encodeURIComponent`) and are not at risk; only the path is interpolated raw.
 *
 * `typeName` is deliberately absent: the example endpoint encodes it itself, and array/map type
 * names legitimately contain `[` and `]`, which this charset rejects.
 */
const PATH_PARAMS = ['orgKey', 'appKey', 'version', 'generatorKey'] as const;

/**
 * Throw a 400 unless `value` is shaped like a key.
 *
 * `.` and `..` are rejected explicitly: both satisfy the character class above, and both still
 * traverse — `/apibuilder/org/app/..` normalizes to `/apibuilder/org`.
 */
export function assertSafeSegment(value: string, name: string): void {
  const pattern = name === 'version' ? SAFE_VERSION_SEGMENT : SAFE_SEGMENT;
  if (value === '.' || value === '..' || !pattern.test(value)) {
    throw error(400, `Invalid ${name}`);
  }
}

/**
 * Validate every path param present on the request.
 *
 * Call this at the top of any load, action or endpoint that passes route params to a generated
 * client. It checks whatever subset is present, so the same single line is correct everywhere and
 * a route that later gains a param is covered without being revisited.
 */
export function assertSafePathParams(params: Partial<Record<string, string>>): void {
  for (const name of PATH_PARAMS) {
    const value = params[name];
    if (value !== undefined) {
      assertSafeSegment(value, name);
    }
  }
}
