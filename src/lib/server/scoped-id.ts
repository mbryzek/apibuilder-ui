import { fail } from '@sveltejs/kit';
import { isApiSuccess, type ApiResponse } from '$lib/api/error-handler';
import { throwIfUnavailable } from '$lib/api/load-error';

/**
 * Resolve an id against a collection the caller has already been authorized for.
 *
 * The mutating actions in this app authorize one thing and then act on another. Every
 * `[orgKey]` action checks `requireAdminForAction(locals, params.orgKey)` — but `orgKey` is a
 * path segment the caller chooses, and the id the action then operates on arrives separately in
 * the form body with nothing tying it to that org. Mallory is a real admin of an org she made
 * herself via `/org/create`, so the admin check passes on `/mallory-org/...` while the id she
 * submits belongs to somebody else's org. That is a confused deputy: the check and the effect
 * are about two different objects.
 *
 * The fix is not to check the id harder, it is to stop accepting one. `findScopedById` lists the
 * collection **scoped to the thing that was authorized** and returns the row only if it is in
 * there, so the id the caller sent can never be more than a selector among rows they were
 * already entitled to. Callers then pass the returned `row.id` to the mutation rather than the
 * value from the form — the same discipline `revokeAdmin` in `[orgKey]/members` already used,
 * generalized so the other four sites can share it.
 *
 * The platform re-checks all of this server-side (`MembershipRequestsServiceImpl`,
 * `MembershipsServiceImpl`, `SubscriptionsServiceImpl`, `core.services.TokensService` each
 * resolve the id under the caller's own `DbAuthorization.User` before acting), so this is
 * defence in depth rather than a hole being closed. It is worth having anyway: the UI-side admin
 * check reads as though it were the gate, and the next endpoint added here will not necessarily
 * be as careful upstream.
 */

/**
 * One page of a scoped listing. `limit`/`offset` are supplied by the scan; everything that
 * defines the *scope* — the org key, the user id — is closed over by the caller.
 */
export type FetchPage<T> = (limit: number, offset: number) => Promise<ApiResponse<T[]>>;

/**
 * Rows per request. A round number just under what these endpoints accept, matching the
 * `limit: 100` the existing loaders use — NOT the ceiling itself, which is each operation's spec to
 * declare and the generated client's to emit. `scoped-id.test.ts` checks this against the declared
 * bound of every operation a caller scans, so a limit the API would reject fails there rather than
 * arriving as a 422 that this function cannot tell from "not in scope".
 */
export const SCAN_LIMIT = 100;

/**
 * A bound on the scan, so a listing that never reports a short page cannot spin forever. 2,500
 * rows is far past any real org's memberships or any user's tokens; a caller past it is refused
 * rather than served, which is the safe direction for a check whose whole job is to refuse.
 */
const MAX_SCAN_PAGES = 25;

/**
 * The row with this id within the scoped listing, or `null` if it is not in there.
 *
 * A listing the API never answered is *not* a "not in scope": reporting an outage as a refusal
 * tells the caller something untrue about their access, exactly as it would in
 * `requireAdminForAction`. `throwIfUnavailable` abandons the request for a 0/429/5xx and lets a
 * definitive 401/403/404 fall through as the empty scope it genuinely is.
 */
export async function findScopedById<T extends { id: string }>(id: string, fetchPage: FetchPage<T>): Promise<T | null> {
  for (let page = 0; page < MAX_SCAN_PAGES; page++) {
    const response = await fetchPage(SCAN_LIMIT, page * SCAN_LIMIT);
    throwIfUnavailable(response);
    if (!isApiSuccess(response)) {
      return null;
    }

    const match = response.data.find((row) => row.id === id);
    if (match) {
      return match;
    }
    // A short page is the last page. Without this the scan would issue MAX_SCAN_PAGES requests
    // for every id that is genuinely absent.
    if (response.data.length < SCAN_LIMIT) {
      return null;
    }
  }
  return null;
}

/**
 * The refusal for an id that is not in the caller's scope.
 *
 * 404 rather than 403 deliberately: "you may not touch this" confirms the id exists, which is
 * the one bit of information an attacker probing guids is after. It is also honest — as far as
 * this org is concerned the row does not exist.
 */
export function outOfScope() {
  return fail(404, { errors: [{ message: 'Not found' }] });
}
