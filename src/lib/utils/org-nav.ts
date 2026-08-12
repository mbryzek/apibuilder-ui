export interface OrgNavLink {
  href: string;
  label: string;
}

/**
 * The organization-level nav links a viewer may follow, in display order.
 *
 * Both AppSidebar (nested inside the app-level sidebar) and OrgSidebar (standalone)
 * render this list, so it lives here rather than being derived twice — adding an org
 * page is one edit, and the test below is what catches a visibility mistake.
 */
export function buildOrgLinks(orgKey: string, isMember: boolean, isAdmin: boolean): OrgNavLink[] {
  const items: OrgNavLink[] = [];
  if (isMember) {
    items.push({ href: `/${orgKey}/subscriptions`, label: 'Subscriptions' });
    items.push({ href: `/${orgKey}/details`, label: 'Org Details' });
  }
  if (isAdmin) {
    items.push({ href: `/${orgKey}/domains`, label: 'Domains' });
    items.push({ href: `/${orgKey}/members`, label: 'Members' });
  }
  return items;
}
