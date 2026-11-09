// @vitest-environment happy-dom

/**
 * The organization switcher: the member's organizations, the one being viewed marked, and Create
 * organization — the way a member of one organization reaches a second.
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
  it('offers a member of one organization that organization and Create organization', async () => {
    const menu = await openWith({ orgs: [organization('acme')], loadError: null });

    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    expect(items.map((a) => a.textContent?.trim())).toEqual(['acme name', 'Create organization']);
    expect(items.map((a) => a.getAttribute('href'))).toEqual(['/acme', '/org/create']);
    expect(button().getAttribute('aria-expanded')).toBe('true');
  });

  it('marks the organization being viewed and names it on the button', async () => {
    page.params = { orgKey: 'globex' };
    const menu = await openWith({ orgs: [organization('acme'), organization('globex')], loadError: null });

    expect(menu.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('/globex');
    expect(menu.querySelectorAll('[aria-current]').length).toBe(1);
    expect(button().textContent?.trim()).toBe('globex name');
  });

  it('reports a failed read and still offers Create organization', async () => {
    const menu = await openWith({ orgs: [], loadError: { status: 500, message: 'The server had a problem.' } });

    expect(menu.querySelector('[role="alert"]')?.textContent).toBe('The server had a problem.');
    expect([...menu.querySelectorAll('[role="menuitem"]')].map((a) => a.getAttribute('href'))).toEqual(['/org/create']);
  });

  it('closes on Escape', async () => {
    await openWith({ orgs: [organization('acme')], loadError: null });

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

  it('carries the switcher for a signed-in member and none for a visitor', () => {
    component = mount(Header, {
      target,
      props: {
        session: { user: { id: 'user-1', person: { name: 'Ada Lovelace' } } } as never,
        myOrgs: Promise.resolve({ orgs: [], loadError: null })
      }
    });
    flushSync();
    expect(target.querySelectorAll('button[aria-label="Switch organization"]').length).toBeGreaterThan(0);

    void unmount(component);
    target.innerHTML = '';
    component = mount(Header, { target, props: {} });
    flushSync();
    expect(target.querySelector('button[aria-label="Switch organization"]')).toBeNull();
  });
});
