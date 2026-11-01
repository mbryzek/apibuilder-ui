// @vitest-environment happy-dom

/**
 * Two org pages whose markup offered something the action could not deliver: an upload Format select
 * that rendered blank because its default matched no option, and subscription toggles shown to a
 * non-member, which the toggle refuses with a 403 page.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Upload from './upload/+page.svelte';
import Subscriptions from './subscriptions/+page.svelte';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(page: typeof Upload | typeof Subscriptions, props: Record<string, unknown>): void {
  component = mount(page as never, { target, props: props as never });
  flushSync();
}

const org = { key: 'acme', name: 'Acme' };

describe('org pages', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('opens the upload Format select on Auto-detect, which sends no type', () => {
    render(Upload, { data: { org, isMember: true }, form: null });

    const select = target.querySelector<HTMLSelectElement>('select[name="spec_type"]')!;
    expect(select.selectedIndex).toBe(0);
    expect(select.value).toBe('');
    expect(select.options[0]!.textContent?.trim()).toBe('Auto-detect');
  });

  it('keeps the Format a refused upload chose', () => {
    render(Upload, { data: { org, isMember: true }, form: { specType: 'service_json' } });

    expect(target.querySelector<HTMLSelectElement>('select[name="spec_type"]')!.value).toBe('service_json');
  });

  it('offers a non-member no subscription toggle', () => {
    render(Subscriptions, { data: { org, isMember: false, isAdmin: false, subscriptions: [], loadError: null }, form: null });

    expect(target.querySelectorAll('form[action="?/toggle"]')).toHaveLength(0);
  });

  it('offers a member a toggle per publication', () => {
    render(Subscriptions, { data: { org, isMember: true, isAdmin: false, subscriptions: [], loadError: null }, form: null });

    expect(target.querySelectorAll('form[action="?/toggle"]').length).toBeGreaterThan(0);
  });
});
