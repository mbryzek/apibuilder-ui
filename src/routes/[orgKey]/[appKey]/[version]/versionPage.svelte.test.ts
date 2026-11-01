// @vitest-environment happy-dom

/**
 * SvelteKit reuses this page for a link to another spec on the same route (an imported type, the
 * Imports tab). What the reader typed or opened on one spec must not follow them onto the next: a
 * delete confirmation left open would offer to delete a version they never chose.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Page from './+page.svelte';
import { page } from '#lib/test-support/app-state.svelte.ts';
import { operation, service } from '#lib/test-support/fixtures.ts';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

const props = $state({
  data: {
    service: service({
      resources: [{ type: 'user', plural: 'users', operations: [operation()], attributes: {} }],
      models: [{ name: 'user', plural: 'users', fields: [], attributes: {} }]
    }),
    version: { version: '1.0.0' },
    isMember: true,
    isWatching: false,
    watchLoadError: null
  },
  form: null
});

function navigateTo(appKey: string, version: string): void {
  page.params = { orgKey: 'acme', appKey, version };
  props.data = { ...props.data, version: { version } };
  flushSync();
}

function buttonNamed(text: string): HTMLButtonElement | undefined {
  return [...target.querySelectorAll('button')].find((b) => b.textContent?.trim() === text);
}

const selectedTab = (): string | undefined => target.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim();

const filter = (): HTMLInputElement => target.querySelector<HTMLInputElement>('input[aria-label="Filter types by name"]')!;

describe('version page across a link to another spec', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
    page.params = { orgKey: 'acme', appKey: 'api', version: '1.0.0' };
    props.data = { ...props.data, version: { version: '1.0.0' }, isMember: true };
    component = mount(Page, { target, props: props as never });
    flushSync();
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('closes an open delete confirmation', () => {
    buttonNamed('Delete Version')!.click();
    flushSync();
    expect(buttonNamed('Yes, Delete Version')).toBeDefined();

    navigateTo('common', 'latest');

    expect(buttonNamed('Yes, Delete Version')).toBeUndefined();
    expect(buttonNamed('Delete Version')).toBeDefined();
  });

  it('clears the type filter', () => {
    filter().value = 'use';
    filter().dispatchEvent(new Event('input'));
    flushSync();

    navigateTo('common', 'latest');

    expect(filter().value).toBe('');
  });

  it('opens the next spec on its default tab', () => {
    [...target.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((t) => t.textContent?.includes('Models'))!.click();
    flushSync();
    expect(selectedTab()).toContain('Models');

    navigateTo('common', 'latest');

    expect(selectedTab()).toContain('Resources');
  });

  it('keeps both while the reader stays on the same spec', () => {
    buttonNamed('Delete Version')!.click();
    filter().value = 'use';
    filter().dispatchEvent(new Event('input'));
    flushSync();

    props.data = { ...props.data, isWatching: true };
    flushSync();

    expect(buttonNamed('Yes, Delete Version')).toBeDefined();
    expect(filter().value).toBe('use');
  });

  it('offers no delete confirmation to a non-member', () => {
    buttonNamed('Delete Version')!.click();
    flushSync();
    props.data = { ...props.data, isMember: false };
    flushSync();

    expect(buttonNamed('Yes, Delete Version')).toBeUndefined();
  });
});
