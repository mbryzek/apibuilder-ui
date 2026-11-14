import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '#lib/test-support/fixtures.ts';
import { invokeAction } from '#lib/test-support/invoke-action.ts';
import { mockApiClients, mockServerAuth } from '#lib/test-support/mocks.ts';
import { MembershipRole, MembershipStatus } from '#generated/com-bryzek-apibuilder.ts';

/**
 * Adding a member by email address reaches the person whether or not they have an account
 * (ISS-86674): the platform adds an account holder at once, and for an address with no account it
 * creates one and emails an invitation to set its password. A nickname still names an existing
 * account and goes through the membership-request path as before.
 */

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
  vi.clearAllMocks();
});

describe('addMember by email', () => {
  it('sends the address to the platform, which invites a person with no account', async () => {
    client.createMembership.mockResolvedValue({ id: 'membership-1', status: MembershipStatus.Invited });

    expect(await addMember({ email_or_nickname: 'roman@example.com', role: 'admin' })).toEqual({
      success: true,
      invited: 'roman@example.com'
    });
    expect(client.createMembership).toHaveBeenCalledWith({
      body: { org_key: 'digestif', email: 'roman@example.com', role: MembershipRole.Admin }
    });
  });

  it('says nothing was sent when the address already had an account', async () => {
    client.createMembership.mockResolvedValue({ id: 'membership-1', status: MembershipStatus.Active });

    expect(await addMember({ email_or_nickname: 'colleague@example.com', role: 'member' })).toEqual({ success: true });
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

    expect(await addMember({ email_or_nickname: 'roman', role: 'member' })).toEqual({ success: true });
    expect(client.getUsers).toHaveBeenCalledWith({ nickname: 'roman' });
    expect(client.createMembership).not.toHaveBeenCalled();
  });
});
