import { error } from '@sveltejs/kit';

/**
 * Reject route params that would steer the upstream API request somewhere else.
 *
 * The generated clients interpolate path params into the upstream URL **without encoding them** —
 * e.g. `getVersionByVersion` builds
 *
 *     `${this.baseUrl}/apibuilder/${params.orgKey}/${params.appKey}/${String(params.version)}`
 *
 * (src/generated/com-bryzek-apibuilder.ts). SvelteKit decodes route params before a handler sees
 * them, so `%2F` arrives as a literal `/` and `%3F` as `?`, and `new URL()` then normalizes the
 * result. Demonstrated against a stand-in upstream:
 *
 *     GET /gilt/apidoc/..%2F..%2F..%2Fusers/service.json  ->  upstream received GET /users
 *     GET /gilt/apidoc/1.0.0%3Flimit%3D999/service.json   ->  upstream received ?limit=999
 *
 * The forged request carries the caller's `session_id` header, so this is a server-side request
 * forgery primitive against whatever `config.apiBaseUrl` points at, reachable without signing in.
 *
 * Validating rather than encoding is deliberate: these are keys, not free text. A key that is not
 * shaped like a key is a malformed request, and saying so is more honest than quietly rewriting it
 * into a lookup that will 404 anyway.
 *
 * The real fix belongs in the apibuilder codegen template, which should encode path params for
 * every generated client — see the note in the PR. This guard is the boundary defence this repo
 * can own on its own, and it stays useful even after the template is fixed.
 */

/**
 * Characters that can appear in an org key, application key, version or generator key.
 *
 * Verified against live data: generator keys are `[a-z0-9_]` (`play_2_x_routes`, `psql_scala`),
 * versions are semver-ish (`1.0.0`, `0.2.1-dev`) plus the literal `latest`. `+` is allowed for
 * semver build metadata; `~` because it is an unreserved URL character. Everything that acts as a
 * delimiter — `/ ? # % \ :` — and every control or non-ASCII character is excluded.
 */
const SAFE_SEGMENT = /^[A-Za-z0-9._~+-]+$/;

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
  if (value === '.' || value === '..' || !SAFE_SEGMENT.test(value)) {
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
