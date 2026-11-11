// @vitest-environment happy-dom

/**
 * The organization switcher: the name of the organization being viewed, cut to 12 characters, and a
 * menu of the member's other organizations, offered only to a member of more than one.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import OrgSwitcher from './OrgSwitcher.svelte';
import Header from './Header.svelte';
import { page } from '$app/state';
import type { MyOrgs } from '#lib/my-orgs.ts';
import type { Organization } from '#generated/com-bryzek-apibuilder.ts';

function organization(key: string): Organization {
  return { guid: `guid-${key}`, key, name: `${key} name`, namespace: `io.${key}`, visibility: 'organization' } as unknown as Organization;
}

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function button(): HTMLButtonElement {
  return target.querySelector('button[aria-label="Switch organization"]') as HTMLButtonElement;
}

async function openWith(myOrgs: MyOrgs): Promise<HTMLElement> {
  component = mount(OrgSwitcher, { target, props: { myOrgs: Promise.resolve(myOrgs), placement: 'down' } });
  await tick();
  await Promise.resolve();
  flushSync();
  button().click();
  flushSync();
  return target.querySelector('[role="menu"][aria-label="Organizations"]') as HTMLElement;
}

beforeEach(() => {
  document.body.innerHTML = '';
  target = document.createElement('div');
  document.body.append(target);
  page.params = {};
});

afterEach(async () => {
  if (component) await unmount(component);
  component = undefined;
});

describe('the organization switcher', () => {
  async function render(myOrgs: MyOrgs): Promise<void> {
    component = mount(OrgSwitcher, { target, props: { myOrgs: Promise.resolve(myOrgs), placement: 'down' } });
    await tick();
    await Promise.resolve();
    flushSync();
  }

  it('shows a member of one organization its name as a link and no menu', async () => {
    await render({ orgs: [organization('acme')], loadError: null });

    expect(button()).toBeNull();
    const link = target.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/acme');
    expect(link.textContent?.trim()).toBe('acme name');
  });

  it('names the organization being viewed and lists only the others', async () => {
    page.params = { orgKey: 'globex' };
    const menu = await openWith({ orgs: [organization('acme'), organization('globex'), organization('initech')], loadError: null });

    expect(button().textContent?.trim()).toBe('globex name');
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    expect(items.map((a) => a.getAttribute('href'))).toEqual(['/acme', '/initech']);
    expect(button().getAttribute('aria-expanded')).toBe('true');
  });

  it('names the first organization when none is being viewed', async () => {
    const menu = await openWith({ orgs: [organization('acme'), organization('globex')], loadError: null });

    expect(button().textContent?.trim()).toBe('acme name');
    expect([...menu.querySelectorAll('[role="menuitem"]')].map((a) => a.getAttribute('href'))).toEqual(['/globex']);
  });

  it('cuts a name longer than 12 characters and keeps the full name as its title', async () => {
    const long = { ...organization('playbook'), name: 'Playbook Systems' } as Organization;
    await openWith({ orgs: [long, organization('bryzek')], loadError: null });

    expect(button().textContent?.trim()).toBe('Playbook Sys...');
    expect(button().getAttribute('title')).toBe('Playbook Systems');
  });

  it('reports a failed read', async () => {
    const menu = await openWith({ orgs: [], loadError: { status: 500, message: 'The server had a problem.' } });

    expect(menu.querySelector('[role="alert"]')?.textContent).toBe('The server had a problem.');
    expect(menu.querySelectorAll('[role="menuitem"]').length).toBe(0);
  });

  it('closes on Escape', async () => {
    await openWith({ orgs: [organization('acme'), organization('globex')], loadError: null });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    flushSync();

    expect(target.querySelector('[role="menu"]')).toBeNull();
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });
});

describe('the header', () => {
  beforeEach(() => {
    // The header reads which route it is on; the `$app/state` double carries no route until set.
    Object.assign(page, { route: { id: '/generators' }, error: null });
  });

  it('carries the switcher for a signed-in member and none for a visitor', async () => {
    component = mount(Header, {
      target,
      props: {
        session: { user: { id: 'user-1', person: { name: 'Ada Lovelace' } } } as never,
        myOrgs: Promise.resolve({ orgs: [organization('acme'), organization('globex')], loadError: null })
      }
    });
    await tick();
    await Promise.resolve();
    flushSync();
    expect(target.querySelectorAll('button[aria-label="Switch organization"]').length).toBeGreaterThan(0);

    void unmount(component);
    target.innerHTML = '';
    component = mount(Header, { target, props: {} });
    flushSync();
    expect(target.querySelector('button[aria-label="Switch organization"]')).toBeNull();
  });
});
