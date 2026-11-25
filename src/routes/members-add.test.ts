import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '#lib/test-support/fixtures.ts';
import { invokeAction } from '#lib/test-support/invoke-action.ts';
import { mockApiClients, mockServerAuth } from '#lib/test-support/mocks.ts';
import { MembershipRole, MembershipStatus } from '#generated/com-bryzek-apibuilder.ts';

const SESSION = session({ user: { id: 'admin-1' } });

const client = {
  createMembership: vi.fn(),
  getUsers: vi.fn(),
  getOrganizationByKey: vi.fn(),
  createMembershipRequest: vi.fn(),
  createMembershipRequestAcceptById: vi.fn()
};

vi.mock('#lib/api/clients.ts', async (importOriginal) => mockApiClients(client, importOriginal));

vi.mock('#lib/server/auth.ts', async (importOriginal) => mockServerAuth(SESSION, client, importOriginal));

const { actions } = await import('./[orgKey]/members/+page.server');

function addMember(form: Record<string, string>) {
  return invokeAction(actions['addMember'], { form, locals: {}, params: { orgKey: 'digestif' } });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('addMember by email', () => {
  it('sends the address to the platform, which invites a person with no account', async () => {
    client.createMembership.mockResolvedValue({ id: 'membership-1', status: MembershipStatus.Invited });

    expect(await addMember({ email_or_nickname: 'roman@example.com', role: 'admin' })).toEqual({
      success: true,
      membership: { id: 'membership-1', status: MembershipStatus.Invited },
      invited: 'roman@example.com'
    });
    expect(client.createMembership).toHaveBeenCalledWith({
      body: { org_key: 'digestif', email: 'roman@example.com', role: MembershipRole.Admin }
    });
  });

  it('says nothing was sent when the address already had an account', async () => {
    client.createMembership.mockResolvedValue({ id: 'membership-1', status: MembershipStatus.Active });

    expect(await addMember({ email_or_nickname: 'colleague@example.com', role: 'member' })).toEqual({
      success: true,
      membership: { id: 'membership-1', status: MembershipStatus.Active }
    });
  });

  it('never answers "User not found" for an address', async () => {
    client.createMembership.mockResolvedValue({ id: 'membership-1', status: MembershipStatus.Invited });

    await addMember({ email_or_nickname: 'nobody@example.com', role: 'member' });

    expect(client.getUsers).not.toHaveBeenCalled();
    expect(client.createMembershipRequest).not.toHaveBeenCalled();
  });
});

describe('addMember by nickname', () => {
  it('adds the existing account through a membership request, as before', async () => {
    client.getUsers.mockResolvedValue([{ id: 'user-2' }]);
    client.getOrganizationByKey.mockResolvedValue({ id: 'org-1' });
    client.createMembershipRequest.mockResolvedValue({ id: 'request-1' });
    client.createMembershipRequestAcceptById.mockResolvedValue({ id: 'membership-2' });

    // It answers with the membership it made, which the page adds to its table without a reload (ISS-87642).
    expect(await addMember({ email_or_nickname: 'roman', role: 'member' })).toEqual({ success: true, membership: { id: 'membership-2' } });
    expect(client.getUsers).toHaveBeenCalledWith({ nickname: 'roman' });
    expect(client.getUsers).toHaveBeenCalledTimes(1);
    expect(client.createMembership).not.toHaveBeenCalled();
  });
});

describe('addMember by user ID', () => {
  it('falls back from nickname to ID for an account without email', async () => {
    client.getUsers.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 'ai-apibuilder', nickname: 'Ott' }]);
    client.getOrganizationByKey.mockResolvedValue({ id: 'org-1' });
    client.createMembershipRequest.mockResolvedValue({ id: 'request-1' });
    client.createMembershipRequestAcceptById.mockResolvedValue({ id: 'membership-2' });

    expect(await addMember({ email_or_nickname: 'ai-apibuilder', role: 'admin' })).toEqual({
      success: true,
      membership: { id: 'membership-2' }
    });
    expect(client.getUsers).toHaveBeenNthCalledWith(1, { nickname: 'ai-apibuilder' });
    expect(client.getUsers).toHaveBeenNthCalledWith(2, { id: 'ai-apibuilder' });
    expect(client.createMembershipRequest).toHaveBeenCalledWith({
      body: { org_id: 'org-1', user_id: 'ai-apibuilder', role: MembershipRole.Admin }
    });
    expect(client.createMembership).not.toHaveBeenCalled();
  });

  it('reports not found only after both lookups return no match', async () => {
    client.getUsers.mockResolvedValue([]);
    const result = await addMember({ email_or_nickname: 'missing', role: 'member' });
    expect(result).toMatchObject({ status: 400, data: { errors: [{ message: 'User not found: missing' }] } });
    expect(client.getUsers).toHaveBeenCalledTimes(2);
    expect(client.createMembershipRequest).not.toHaveBeenCalled();
  });

  it.each([0, 1])('preserves an API failure at lookup %s', async (successfulLookups) => {
    if (successfulLookups) client.getUsers.mockResolvedValueOnce([]);
    client.getUsers.mockRejectedValueOnce({ status: 503, message: 'Lookup unavailable' });
    const result = await addMember({ email_or_nickname: 'ai-apibuilder', role: 'member' });
    expect(result).toMatchObject({ status: 503 });
    expect(client.getUsers).toHaveBeenCalledTimes(successfulLookups + 1);
    expect(client.createMembershipRequest).not.toHaveBeenCalled();
  });
});
