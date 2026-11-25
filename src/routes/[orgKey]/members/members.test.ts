// @vitest-environment happy-dom

/**
 * The members page applies what its forms answer to the table it shows, so a role change, a
 * removal or an add re-runs neither its own load nor the org layout's (four calls a refresh spent
 * on one row). A change to the signed-in user's own membership is the exception: it moves what the
 * layout decided the page offers, so every load re-runs. ISS-87642
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Members from './+page.svelte';
import { applyChange, changeOf, changesOwnAccess } from './changes.ts';
import { submitFor } from '#lib/test-support/app-forms.ts';
import { invalidated, refreshes } from '#lib/test-support/app-navigation.ts';
import { MembershipRole, MembershipStatus, type Membership } from '#generated/com-bryzek-apibuilder.ts';

function member(id: string, userId: string, role: MembershipRole = MembershipRole.Member): Membership {
  return {
    id,
    role,
    status: MembershipStatus.Active,
    user: { id: userId, nickname: `nick-${userId}`, email: `${userId}@example.com` }
  } as unknown as Membership;
}

const ME = 'user-me';
const ALICE = member('m-alice', 'user-alice');
const BOB = member('m-bob', 'user-bob', MembershipRole.Admin);
const MINE = member('m-me', ME, MembershipRole.Admin);

describe('applyChange', () => {
  it('replaces a changed row where it stands', () => {
    const promoted = member('m-alice', 'user-alice', MembershipRole.Admin);
    expect(applyChange([ALICE, BOB], { membership: promoted })).toEqual([promoted, BOB]);
  });

  it('drops a removed row', () => {
    expect(applyChange([ALICE, BOB], { removed: 'm-alice' })).toEqual([BOB]);
  });

  it('appends a new member, and replaces the same person under another id rather than listing them twice', () => {
    const carol = member('m-carol', 'user-carol');
    expect(applyChange([ALICE], { membership: carol })).toEqual([ALICE, carol]);
    const aliceAgain = member('m-alice-2', 'user-alice', MembershipRole.Admin);
    expect(applyChange([ALICE, BOB], { membership: aliceAgain })).toEqual([aliceAgain, BOB]);
  });

  it('reads only a membership and a removed id from an answer', () => {
    expect(changeOf({ success: true, invited: 'x@example.com' })).toEqual({});
    expect(changeOf(undefined)).toEqual({});
    expect(changeOf({ removed: 'm-1' })).toEqual({ removed: 'm-1' });
  });

  it('tells a change to the signed-in user apart from one to a colleague', () => {
    expect(changesOwnAccess([ALICE, MINE], { membership: member('m-me', ME) }, ME)).toBe(true);
    expect(changesOwnAccess([ALICE, MINE], { removed: 'm-me' }, ME)).toBe(true);
    expect(changesOwnAccess([ALICE, MINE], { removed: 'm-alice' }, ME)).toBe(false);
    expect(changesOwnAccess([ALICE, MINE], { membership: ALICE }, undefined)).toBe(false);
  });
});

describe('the members page', () => {
  let target: HTMLElement;
  let component: Record<string, unknown> | undefined;

  beforeEach(() => {
    document.body.innerHTML = '';
    invalidated.length = 0;
    refreshes.all = 0;
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  function render(memberships: Membership[]): void {
    const data = {
      org: { key: 'acme', name: 'Acme' },
      session: { user: { id: ME } },
      isAdmin: true,
      memberships,
      offset: 0,
      limit: 25,
      hasMore: false,
      pendingRequestsCount: 0,
      pendingRequestsCapped: false,
      loadError: null
    };
    component = mount(Members as never, { target, props: { data, form: null } as never });
    flushSync();
  }

  async function answer(form: HTMLFormElement, data: Record<string, unknown>): Promise<unknown[]> {
    const settled = await submitFor(form)();
    const updates: unknown[] = [];
    await settled({ update: async (opts) => void updates.push(opts), result: { type: 'success', data } });
    flushSync();
    return updates;
  }

  function rowText(): string[] {
    return [...target.querySelectorAll('tbody tr')].map((row) => row.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  }

  it('names every supported member identifier', () => {
    render([]);
    expect(target.querySelector('input[name="email_or_nickname"]')?.getAttribute('placeholder')).toBe('Email, nickname or user ID');
  });

  it("shows a colleague's new role without re-running any load", async () => {
    render([ALICE, BOB]);

    const updates = await answer(target.querySelector<HTMLFormElement>('form[action="?/makeAdmin"]')!, {
      success: true,
      membership: member('m-alice', 'user-alice', MembershipRole.Admin)
    });

    expect(updates).toEqual([{ refreshAll: false }]);
    expect(invalidated).toEqual([]);
    expect(refreshes.all).toBe(0);
    expect(target.querySelectorAll('form[action="?/makeAdmin"]')).toHaveLength(0);
    expect(rowText()[0]).toContain('admin');
  });

  it('drops a removed member and adds a new one in place', async () => {
    render([ALICE, BOB]);

    target.querySelector<HTMLButtonElement>('tbody tr button[type="button"]')!.click();
    flushSync();
    await answer(target.querySelector<HTMLFormElement>('form[action="?/removeMember"]')!, { success: true, removed: 'm-alice' });
    await answer(target.querySelector<HTMLFormElement>('form[action="?/addMember"]')!, {
      success: true,
      membership: member('m-carol', 'user-carol')
    });

    expect(rowText().map((text) => text.split(' ')[0])).toEqual(['nick-user-bob', 'nick-user-carol']);
    expect(refreshes.all).toBe(0);
  });

  it('re-runs every load when the signed-in user changes their own role', async () => {
    render([ALICE, MINE]);

    const forms = target.querySelectorAll<HTMLFormElement>('form[action="?/revokeAdmin"]');
    await answer(forms[0]!, { success: true, membership: member('m-me', ME) });

    expect(refreshes.all).toBe(1);
  });
});
