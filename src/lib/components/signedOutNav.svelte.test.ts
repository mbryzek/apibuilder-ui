// @vitest-environment happy-dom

/**
 * What a visitor who is not a member can follow. Search and an application's history answer anybody
 * for what is public, so their links are not a member's alone; the settings stay one.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import AppSidebar from './AppSidebar.svelte';
import Header from './Header.svelte';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/'), params: {}, data: {}, route: { id: null }, error: null } }));

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

const hrefs = (): (string | null)[] => [...target.querySelectorAll('a')].map((a) => a.getAttribute('href'));

beforeEach(() => {
  document.body.innerHTML = '';
  target = document.createElement('div');
  document.body.append(target);
});

afterEach(() => {
  if (component) {
    void unmount(component);
    component = undefined;
  }
});

describe('the header, signed out', () => {
  it('offers search', () => {
    component = mount(Header, { target, props: {} });

    expect(target.querySelectorAll('form[action="/search"] input[name="q"]').length).toBeGreaterThan(0);
  });
});

describe('the application sidebar, outside the organization', () => {
  it('links the history and not the settings', () => {
    component = mount(AppSidebar, {
      target,
      props: { orgKey: 'public-org', appKey: 'app', version: 'latest', appName: 'App', isMember: false, isAdmin: false }
    });

    expect(hrefs()).toContain('/public-org/app/latest/history');
    expect(hrefs()).not.toContain('/public-org/app/latest/settings');
  });
});
