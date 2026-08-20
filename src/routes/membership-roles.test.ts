import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '$lib/test-support/fixtures';
import { mockApiClients, mockServerAuth } from '$lib/test-support/mocks';
import { MembershipRole } from '$generated/com-bryzek-apibuilder';

/**
 * Promoting and demoting a colleague must leave them IN the organization (ISS-4833).
 *
 * A user holds exactly one membership per organization: accepting a membership request upserts
 * that row rather than adding a second one. So the two obvious spellings of "revoke admin" are
 * both wrong — deleting the admin membership deletes the person's only membership, which is
 * `removeMember`, and accepting a `member` request against an existing admin is a no-op rather
 * than a demotion. Both actions go through `updateMembershipById` instead, which changes the role
 * on the row that is already there.
 *
 * These assert on the calls rather than on a fake backend, so the "does not delete" cases are
 * exactly what fails on the unfixed code.
 */

const SESSION = session({ user: { id: 'admin-1' } });

const client = {
  getMemberships: vi.fn(),
  updateMembershipById: vi.fn(),
  deleteMembershipById: vi.fn(),
  createMembershipRequest: vi.fn(),
  createMembershipRequestAcceptById: vi.fn(),
  getOrganizationByKey: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

vi.mock('$lib/server/auth', async (importOriginal) => mockServerAuth(SESSION, client, importOriginal));

const { actions } = await import('./[orgKey]/members/+page.server');

function invoke(action: unknown, form: Record<string, string>) {
  const body = new FormData();
  for (const [name, value] of Object.entries(form)) {
    body.append(name, value);
  }
  const event = {
    request: new Request('http://localhost/', { method: 'POST', body }),
    locals: {},
    params: { orgKey: 'my-org' }
  };
  return (action as (e: typeof event) => Promise<unknown>)(event);
}

beforeEach(() => {
  vi.clearAllMocks();
  client.getMemberships.mockResolvedValue([{ id: 'membership-1', role: MembershipRole.Admin }]);
  client.updateMembershipById.mockResolvedValue({ id: 'membership-1', role: MembershipRole.Member });
});

describe('revokeAdmin', () => {
  it('lowers the role on the existing membership', async () => {
    expect(await invoke(actions['revokeAdmin'], { guid: 'membership-1' })).toEqual({ success: true });
    expect(client.updateMembershipById).toHaveBeenCalledWith({
      id: 'membership-1',
      body: { role: MembershipRole.Member }
    });
  });

  it('does not delete the membership — that would remove the person from the organization', async () => {
    await invoke(actions['revokeAdmin'], { guid: 'membership-1' });
    expect(client.deleteMembershipById).not.toHaveBeenCalled();
  });

  it('refuses a membership that is not in this org rather than acting on it', async () => {
    client.getMemberships.mockResolvedValue([]);

    expect(await invoke(actions['revokeAdmin'], { guid: 'other-org-membership' })).toMatchObject({
      status: 404,
      data: { errors: [{ message: 'Not found' }] }
    });
    expect(client.updateMembershipById).not.toHaveBeenCalled();
  });

  it('refuses a blank guid rather than scanning for it', async () => {
    expect(await invoke(actions['revokeAdmin'], { guid: '  ' })).toMatchObject({
      status: 400,
      data: { errors: [{ message: 'Invalid request' }] }
    });
    expect(client.getMemberships).not.toHaveBeenCalled();
  });
});

describe('makeAdmin', () => {
  it('raises the role on the existing membership', async () => {
    client.updateMembershipById.mockResolvedValue({ id: 'membership-1', role: MembershipRole.Admin });

    expect(await invoke(actions['makeAdmin'], { guid: 'membership-1' })).toEqual({ success: true });
    expect(client.updateMembershipById).toHaveBeenCalledWith({
      id: 'membership-1',
      body: { role: MembershipRole.Admin }
    });
  });

  it('does not go through the membership-request path, which cannot express the other direction', async () => {
    await invoke(actions['makeAdmin'], { guid: 'membership-1' });
    expect(client.createMembershipRequest).not.toHaveBeenCalled();
    expect(client.createMembershipRequestAcceptById).not.toHaveBeenCalled();
  });

  it('refuses a membership that is not in this org rather than acting on it', async () => {
    client.getMemberships.mockResolvedValue([]);

    expect(await invoke(actions['makeAdmin'], { guid: 'other-org-membership' })).toMatchObject({
      status: 404,
      data: { errors: [{ message: 'Not found' }] }
    });
    expect(client.updateMembershipById).not.toHaveBeenCalled();
  });
});
