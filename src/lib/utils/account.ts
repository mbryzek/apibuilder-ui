import type { User } from '$generated/com-bryzek-platform';

/** The name the account menu shows: the person's name, falling back to their email. */
export function displayName(user: User): string {
  return user.person.name?.trim() || user.person.email?.address?.trim() || '';
}

/**
 * The avatar's initials: the first letters of the first and last word of the name, or the first
 * two letters of a one-word name.
 */
export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return '?';
  const last = parts[parts.length - 1];
  if (parts.length === 1 || !last) return first.slice(0, 2).toUpperCase();
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}
