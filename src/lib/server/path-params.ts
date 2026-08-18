import { error } from '@sveltejs/kit';

/**
 * Reject route params that would steer the upstream API request somewhere else.
 *
 * SvelteKit decodes route params before a handler sees them, so `%2F` arrives as a literal `/`
 * and `%3F` as `?`. This guard was written when the generated clients interpolated path params
 * into the upstream URL **without encoding them**, which made that decode a server-side request
 * forgery primitive against whatever `config.apiBaseUrl` points at, reachable without signing in.
 * Demonstrated at the time against a stand-in upstream:
 *
 *     GET /gilt/apidoc/..%2F..%2F..%2Fusers/service.json  ->  upstream received GET /users
 *     GET /gilt/apidoc/1.0.0%3Flimit%3D999/service.json   ->  upstream received ?limit=999
 *
 * **That is no longer how the clients are generated, and this comment used to say otherwise.**
 * The codegen template now wraps every interpolated path param — `getVersionByVersion` builds
 *
 *     `${this.baseUrl}/apibuilder/${encodeURIComponent(params.orgKey)}/...`
 *
 * (src/generated/com-bryzek-apibuilder.ts) — so the SSRF above is closed at the source, for every
 * caller, and re-running those two requests today sends the traversal upstream as one opaque,
 * percent-encoded segment.
 *
 * **Do not conclude from that that this guard is now dead.** What it still closes is an open
 * redirect: several actions reflect `params.orgKey` into `redirect(303, `/${params.orgKey}/...`)`,
 * and SvelteKit sets `Location` verbatim, so an `orgKey` of `/evil.com` yields a scheme-relative
 * `//evil.com/...` that browsers resolve to another host. `$lib/server/auth`'s
 * `requireMemberForAction`/`requireAdminForAction` call `assertSafeSegment` for exactly this
 * reason, which is why every org-scoped action is covered without repeating the call.
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
