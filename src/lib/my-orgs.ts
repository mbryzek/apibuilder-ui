import type { LoadError } from '#lib/api/load-error.ts';
import type { Organization } from '#generated/com-bryzek-apibuilder.ts';

/**
 * The signed-in member's organizations, or why they could not be read. The root layout loads it
 * once per session and every signed-in page reads it: the header's organization switcher and the
 * home page's My Organizations. A failed read keeps its error, so neither tells a member of several
 * organizations that they belong to none.
 */
export interface MyOrgs {
  orgs: Organization[];
  loadError: LoadError | null;
}
