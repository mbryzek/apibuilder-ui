import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '$lib/test-support/fixtures';
import { mockApiClients } from '$lib/test-support/mocks';
import { caughtAsync } from '$lib/test-support/throws';

/**
 * The two org membership guards share one gate, so each case runs against both: a member
 * passes, an empty page is a 403, and an unanswered lookup is an outage rather than a denial.
 */

const SESSION = session({ user: { id: 'alice' } });
const LOCALS: App.Locals = { session: SESSION };

const client = { getMemberships: vi.fn() };

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

const { requireMemberForAction, requireAdminForAction } = await import('./auth');

const GUARDS = [
  { name: 'requireMemberForAction', guard: requireMemberForAction, role: undefined },
  { name: 'requireAdminForAction', guard: requireAdminForAction, role: 'admin' }
] as const;

beforeEach(() => {
  client.getMemberships.mockReset();
});

describe.each(GUARDS)('$name', ({ guard, role }) => {
  it('returns the session for a caller holding a membership', async () => {
    client.getMemberships.mockResolvedValue([{ id: 'membership-1' }]);
    await expect(guard(LOCALS, 'gilt')).resolves.toBe(SESSION);
    expect(client.getMemberships).toHaveBeenCalledWith({ orgKey: 'gilt', userId: 'alice', role, limit: 25, offset: 0 });
  });

  it('refuses a caller with no membership', async () => {
    client.getMemberships.mockResolvedValue([]);
    const thrown = await caughtAsync(() => guard(LOCALS, 'gilt'));
    expect(thrown.status).toBe(403);
    expect(thrown.body?.message).toBe('Forbidden');
  });

  it('reports an unanswered lookup as an outage, not a denial', async () => {
    client.getMemberships.mockRejectedValue(new Error('fetch failed'));
    const thrown = await caughtAsync(() => guard(LOCALS, 'gilt'));
    expect(thrown.status).not.toBe(403);
    expect(thrown.status).toBeGreaterThanOrEqual(500);
  });

  it('sends an anonymous caller to sign in without asking about memberships', async () => {
    expect((await caughtAsync(() => guard({}, 'gilt'))).status).toBe(302);
    expect(client.getMemberships).not.toHaveBeenCalled();
  });
});
