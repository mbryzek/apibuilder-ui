import { describe, expect, it } from 'vitest';
import { buildOrgLinks } from './org-nav';

function hrefs(isMember: boolean, isAdmin: boolean): string[] {
  return buildOrgLinks('bryzek', isMember, isAdmin).map((l) => l.href);
}

describe('buildOrgLinks', () => {
  it('shows nothing to a viewer who is neither a member nor an admin', () => {
    expect(hrefs(false, false)).toEqual([]);
  });

  it('shows the member links to a member', () => {
    expect(hrefs(true, false)).toEqual(['/bryzek/subscriptions', '/bryzek/details']);
  });

  it('adds the admin links for an admin, member links first', () => {
    expect(hrefs(true, true)).toEqual(['/bryzek/subscriptions', '/bryzek/details', '/bryzek/domains', '/bryzek/members']);
  });

  it('shows only the admin links when a viewer is an admin but not a member', () => {
    // Not a state the app produces today, but the two flags are independent props on
    // both sidebars, so pin which links each one is responsible for.
    expect(hrefs(false, true)).toEqual(['/bryzek/domains', '/bryzek/members']);
  });

  it('labels each link', () => {
    expect(buildOrgLinks('bryzek', true, true).map((l) => l.label)).toEqual(['Subscriptions', 'Org Details', 'Domains', 'Members']);
  });

  it('builds hrefs from the org key it is given', () => {
    expect(hrefs(true, false)).toEqual(['/bryzek/subscriptions', '/bryzek/details']);
    expect(buildOrgLinks('flow', true, false).map((l) => l.href)).toEqual(['/flow/subscriptions', '/flow/details']);
  });
});
