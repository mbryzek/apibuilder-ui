import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The four actions that authorized one object and then acted on another (ISS-491).
 *
 * These assert the wiring, not the helper — `$lib/server/scoped-id` has its own unit tests. The
 * bug was never that the scoped lookup was wrong, it was that the actions did not do one: each
 * checked `requireAdminForAction(locals, params.orgKey)` and then passed a guid straight from the
 * form body to the mutation. Every "does not touch" case below passes the id of a row belonging
 * to `victim-org` while acting as an admin of `mallory-org`, which is exactly the scenario in the
 * issue, and each fails on the unfixed code.
 */

const SESSION = { id: 'session-1', user: { id: 'mallory' } };

const client = {
  getMembershipRequests: vi.fn(),
  createMembershipRequestAcceptById: vi.fn(),
  createMembershipRequestDeclineById: vi.fn(),
  getMemberships: vi.fn(),
  deleteMembershipById: vi.fn(),
  getSubscriptions: vi.fn(),
  createSubscription: vi.fn(),
  deleteSubscriptionById: vi.fn(),
  getTokensUsersByUserId: vi.fn(),
  deleteTokenById: vi.fn()
};

vi.mock('$lib/api/clients', () => ({
  apiBuilderClient: () => client,
  platformClient: () => client,
  getSessionHeaders: () => ({})
}));

vi.mock('$lib/server/auth', () => ({
  requireAuth: () => SESSION,
  requireAuthForAction: () => SESSION,
  requireMemberForAction: async () => SESSION,
  requireAdminForAction: async () => SESSION
}));

const { actions: membershipRequestActions } = await import('./[orgKey]/membership-requests/+page.server');
const { actions: memberActions } = await import('./[orgKey]/members/+page.server');
const { actions: subscriptionActions } = await import('./[orgKey]/subscriptions/+page.server');
const { actions: tokenActions } = await import('./tokens/[guid]/+page.server');

/** Invoke an action the way SvelteKit would, with only the fields these actions read. */
function invoke(
  action: unknown,
  { form = {}, params = { orgKey: 'mallory-org' } }: { form?: Record<string, string>; params?: Record<string, string> } = {}
) {
  const body = new FormData();
  for (const [key, value] of Object.entries(form)) {
    body.append(key, value);
  }
  const event = { request: new Request('http://localhost/', { method: 'POST', body }), locals: {}, params };
  return (action as (e: typeof event) => Promise<unknown>)(event);
}

/** SvelteKit's `ActionFailure` — `fail(404, ...)` from `outOfScope()`. */
function expectNotFound(result: unknown) {
  expect(result).toMatchObject({ status: 404, data: { errors: [{ message: 'Not found' }] } });
}

beforeEach(() => {
  vi.clearAllMocks();
  // mallory-org is real and Mallory really does administer it — it just has none of these rows.
  client.getMembershipRequests.mockResolvedValue([]);
  client.getMemberships.mockResolvedValue([]);
  client.getSubscriptions.mockResolvedValue([]);
  client.getTokensUsersByUserId.mockResolvedValue([]);
  client.createSubscription.mockResolvedValue({ id: 'sub-new' });
});

describe('membership request accept/decline', () => {
  it('does not accept a request belonging to another org', async () => {
    expectNotFound(await invoke(membershipRequestActions['accept'], { form: { guid: 'victim-org-request' } }));
    expect(client.createMembershipRequestAcceptById).not.toHaveBeenCalled();
  });

  it('does not decline a request belonging to another org', async () => {
    expectNotFound(await invoke(membershipRequestActions['decline'], { form: { guid: 'victim-org-request' } }));
    expect(client.createMembershipRequestDeclineById).not.toHaveBeenCalled();
  });

  it('accepts a request that is genuinely in this org', async () => {
    client.getMembershipRequests.mockResolvedValue([{ id: 'own-request' }]);
    client.createMembershipRequestAcceptById.mockResolvedValue({ id: 'membership-1' });

    expect(await invoke(membershipRequestActions['accept'], { form: { guid: 'own-request' } })).toEqual({ success: true });
    expect(client.getMembershipRequests).toHaveBeenCalledWith(expect.objectContaining({ orgKey: 'mallory-org' }));
    expect(client.createMembershipRequestAcceptById).toHaveBeenCalledWith('own-request', expect.anything());
  });
});

describe('removeMember', () => {
  it('does not delete a membership belonging to another org', async () => {
    expectNotFound(await invoke(memberActions['removeMember'], { form: { guid: 'victim-org-membership' } }));
    expect(client.deleteMembershipById).not.toHaveBeenCalled();
  });

  it('deletes a membership that is genuinely in this org', async () => {
    client.getMemberships.mockResolvedValue([{ id: 'own-membership' }]);
    client.deleteMembershipById.mockResolvedValue(undefined);

    expect(await invoke(memberActions['removeMember'], { form: { guid: 'own-membership' } })).toEqual({ success: true });
    expect(client.deleteMembershipById).toHaveBeenCalledWith('own-membership', expect.anything());
  });
});

describe('subscription toggle', () => {
  it('ignores a subscription id in the form and subscribes instead', async () => {
    // The form no longer carries `subscription_id`; a forged one must not reach the delete.
    await invoke(subscriptionActions['toggle'], {
      form: { publication: 'membership_requests.create', subscription_id: 'victim-org-subscription' }
    });
    expect(client.deleteSubscriptionById).not.toHaveBeenCalled();
    expect(client.createSubscription).toHaveBeenCalled();
  });

  it('unsubscribes the id it resolved from this org and publication', async () => {
    client.getSubscriptions.mockResolvedValue([{ id: 'own-subscription' }]);
    client.deleteSubscriptionById.mockResolvedValue(undefined);

    expect(await invoke(subscriptionActions['toggle'], { form: { publication: 'membership_requests.create' } })).toEqual({
      success: true
    });
    expect(client.getSubscriptions).toHaveBeenCalledWith(
      expect.objectContaining({ organizationKey: 'mallory-org', userId: 'mallory', publication: 'membership_requests.create' })
    );
    expect(client.deleteSubscriptionById).toHaveBeenCalledWith('own-subscription', expect.anything());
  });

  it('rejects a publication that is not in the enum', async () => {
    expect(await invoke(subscriptionActions['toggle'], { form: { publication: 'not_a_publication' } })).toMatchObject({ status: 400 });
    expect(client.createSubscription).not.toHaveBeenCalled();
  });
});

describe('token delete', () => {
  it("does not delete a token that is not the caller's", async () => {
    expectNotFound(await invoke(tokenActions['delete'], { params: { guid: 'someone-elses-token' } }));
    expect(client.deleteTokenById).not.toHaveBeenCalled();
  });

  it('does not spend the one-time cleartext to authorize the delete', async () => {
    client.getTokensUsersByUserId.mockResolvedValue([{ id: 'own-token' }]);
    client.deleteTokenById.mockResolvedValue(undefined);

    // `getTokenCleartextById` claims the cleartext on read, so using it as the ownership check
    // would destroy the value the page exists to display.
    await expect(invoke(tokenActions['delete'], { params: { guid: 'own-token' } })).rejects.toMatchObject({ status: 303 });
    expect(client.deleteTokenById).toHaveBeenCalledWith('own-token', expect.anything());
  });
});
