import type { Membership } from '#generated/com-bryzek-apibuilder.ts';

/**
 * What a members action answers on success: the membership it now holds (a role change, an add),
 * or the id of the one it deleted. The page applies it to the table it already shows, so a change
 * to one row re-runs no load. ISS-87642
 */
export interface MembershipChange {
  membership?: Membership;
  removed?: string;
}

/** Reads a form action's data as a change, ignoring anything that is not one. */
export function changeOf(data: Record<string, unknown> | undefined): MembershipChange {
  const change: MembershipChange = {};
  const membership = data?.['membership'];
  const removed = data?.['removed'];
  if (membership && typeof membership === 'object') change.membership = membership as Membership;
  if (typeof removed === 'string') change.removed = removed;
  return change;
}

/**
 * The table's rows with `change` applied: a deleted row dropped, a changed row replaced where it
 * stands, and a new one appended. A user holds one membership per organization, so a row matching
 * the answer's user is the same person's, whatever its id.
 */
export function applyChange(rows: readonly Membership[], change: MembershipChange): Membership[] {
  let next = change.removed === undefined ? [...rows] : rows.filter((row) => row.id !== change.removed);
  const membership = change.membership;
  if (membership) {
    const at = next.findIndex((row) => row.id === membership.id || row.user.id === membership.user.id);
    next = at >= 0 ? next.map((row, i) => (i === at ? membership : row)) : [...next, membership];
  }
  return next;
}

/**
 * Whether the change is to the signed-in user's own membership, which the org layout read to decide
 * what this page offers (`isAdmin`, `isMember`): only a re-run of every load shows that, so the page
 * takes one rather than leave admin controls up for someone who is no longer an admin.
 */
export function changesOwnAccess(rows: readonly Membership[], change: MembershipChange, userId: string | undefined): boolean {
  if (userId === undefined) return false;
  if (change.membership?.user.id === userId) return true;
  return change.removed !== undefined && rows.some((row) => row.id === change.removed && row.user.id === userId);
}
