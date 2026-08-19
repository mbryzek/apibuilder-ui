import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '$lib/test-support/fixtures';
import { mockApiClients } from '$lib/test-support/mocks';
import { caughtAsync } from '$lib/test-support/throws';

/**
 * The org-scoped writes, and who is allowed to make them.
 *
 * Two separate gaps, both of the same shape — a check that the UI *looked* like it was making and
 * the server was not:
 *
 *   - `[orgKey]/upload` authorized with a bare `requireAuthForAction`, so any signed-in user could
 *     POST a spec to any org. Every sibling write in the tree requires membership or admin, and
 *     the page's own "+ Upload" link is gated on `isMember`, so members-only was always the
 *     intent — hiding a link is not access control.
 *   - `requireMemberForAction`/`requireAdminForAction` took `orgKey` straight from the route and
 *     never checked its shape, while several actions reflect it into a redirect target.
 *
 * These assert the wiring rather than the helpers, which have their own unit tests: the bug was
 * never that `assertSafeSegment` or the membership lookup was wrong, it was that the action did
 * not perform one.
 */

const SESSION = session({ user: { id: 'mallory' } });
/** Only `session` is read by these helpers; the rest of `App.Locals` is irrelevant here. */
const LOCALS: App.Locals = { session: SESSION };

const client = {
  getMemberships: vi.fn(),
  updateVersionByVersion: vi.fn(),
  createWatch: vi.fn(),
  getWatches: vi.fn(),
  deleteWatchById: vi.fn(),
  getOrganizationByKey: vi.fn(),
  createMembershipRequest: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions: uploadActions } = await import('./[orgKey]/upload/+page.server');
const { actions: versionActions } = await import('./[orgKey]/[appKey]/[version]/+page.server');
const { actions: joinActions } = await import('./[orgKey]/memberships/request/+page.server');
const { load: appRedirectLoad } = await import('./[orgKey]/[appKey]/+page.server');
const { requireMemberForAction, requireAdminForAction } = await import('$lib/server/auth');

/** Invoke an action the way SvelteKit would, with only the fields these actions read. */
function invokeUpload(form: Record<string, string | File>, orgKey = 'victim-org') {
  const body = new FormData();
  for (const [key, value] of Object.entries(form)) {
    body.append(key, value);
  }
  const event = {
    request: new Request('http://localhost/', { method: 'POST', body }),
    locals: LOCALS,
    params: { orgKey }
  };
  return (uploadActions['default'] as (e: typeof event) => Promise<unknown>)(event);
}

beforeEach(() => {
  vi.clearAllMocks();
  // Mallory is signed in and belongs to nothing.
  client.getMemberships.mockResolvedValue([]);
});

describe('upload requires membership, not merely a session', () => {
  it('refuses a spec upload to an org the caller does not belong to', async () => {
    const spec = new File(['{"name":"whatever"}'], 'api.json', { type: 'application/json' });

    expect((await caughtAsync(() => invokeUpload({ file: spec, app_key: 'anything' }))).status).toBe(403);
    expect(client.updateVersionByVersion).not.toHaveBeenCalled();
  });

  it('allows the upload once the caller is a member of that org', async () => {
    client.getMemberships.mockResolvedValue([{ id: 'membership-1' }]);
    client.updateVersionByVersion.mockResolvedValue({ version: '1.0.0' });
    const spec = new File(['{"name":"whatever"}'], 'api.json', { type: 'application/json' });

    // Success redirects (303), so the throw is the pass condition here.
    expect((await caughtAsync(() => invokeUpload({ file: spec, app_key: 'anything' }))).status).toBe(303);
    expect(client.getMemberships).toHaveBeenCalledWith(expect.objectContaining({ orgKey: 'victim-org', userId: 'mallory' }));
    expect(client.updateVersionByVersion).toHaveBeenCalled();
  });
});

describe('org-scoped action helpers validate orgKey', () => {
  // `/evil.com` is the payload that matters: SvelteKit decodes `%2F` before the handler runs and
  // sets `Location` verbatim, so reflecting it makes `//evil.com/...` — another origin.
  const hostile = ['/evil.com', '..', '.', 'org?limit=999', 'org#frag'];

  for (const orgKey of hostile) {
    it(`rejects ${JSON.stringify(orgKey)} before looking up membership`, async () => {
      expect((await caughtAsync(() => requireMemberForAction(LOCALS, orgKey))).status).toBe(400);
      expect((await caughtAsync(() => requireAdminForAction(LOCALS, orgKey))).status).toBe(400);
      expect(client.getMemberships).not.toHaveBeenCalled();
    });
  }

  it('still accepts a normal org key', async () => {
    client.getMemberships.mockResolvedValue([{ id: 'membership-1' }]);
    await expect(requireMemberForAction(LOCALS, 'gilt')).resolves.toEqual(SESSION);
  });
});

/**
 * The org-scoped writes that do NOT go through the membership guards.
 *
 * `requireAuthForAction` authorizes a session and validates nothing about the route, so an action
 * using it inherits no `orgKey` check — and `watch`/`unwatch` reflect `params.orgKey` straight
 * into their redirect target. `[orgKey]/[appKey]`'s load is the same shape without an action: it
 * redirects on two params it never validates, refused today only because a sibling layout happens
 * to 404 first.
 *
 * This walks them rather than testing the guard again, because the guard was never wrong — the
 * gap was a route that did not call it, which is the thing a helper's own unit test cannot see.
 */
describe('org-scoped routes outside the membership guards validate orgKey too', () => {
  const hostile = ['/evil.com', '..', '.', 'org?limit=999', 'org#frag'];

  /** Invoke an action the way SvelteKit would, with only the fields these actions read. */
  function invoke(action: unknown, orgKey: string) {
    const event = {
      request: new Request('http://localhost/', { method: 'POST', body: new FormData() }),
      locals: LOCALS,
      params: { orgKey, appKey: 'app', version: '1.0.0' }
    };
    return (action as (e: typeof event) => Promise<unknown>)(event);
  }

  const sites: [string, (orgKey: string) => unknown][] = [
    ['[appKey]/[version] watch', (orgKey) => invoke(versionActions['watch'], orgKey)],
    ['[appKey]/[version] unwatch', (orgKey) => invoke(versionActions['unwatch'], orgKey)],
    ['memberships/request', (orgKey) => invoke(joinActions['default'], orgKey)],
    ['[appKey] latest-version redirect', (orgKey) => appRedirectLoad({ params: { orgKey, appKey: 'app' } } as never)]
  ];

  for (const [name, call] of sites) {
    for (const orgKey of hostile) {
      it(`${name} refuses ${JSON.stringify(orgKey)}`, async () => {
        const thrown = await caughtAsync(() => call(orgKey));

        expect(thrown.status).toBe(400);
        // A 400 that arrives after the redirect has been built is not a refusal.
        expect(thrown.location).toBeUndefined();
        expect(client.createWatch).not.toHaveBeenCalled();
        expect(client.getWatches).not.toHaveBeenCalled();
        expect(client.getOrganizationByKey).not.toHaveBeenCalled();
      });
    }
  }

  it('still redirects a normal org key to the latest version', async () => {
    const thrown = await caughtAsync(() => appRedirectLoad({ params: { orgKey: 'gilt', appKey: 'apidoc' } } as never));

    expect(thrown.status).toBe(302);
    expect(thrown.location).toBe('/gilt/apidoc/latest');
  });
});
