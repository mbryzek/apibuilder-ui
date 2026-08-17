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
  updateVersionByVersion: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions: uploadActions } = await import('./[orgKey]/upload/+page.server');
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
