// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import UnionList from './UnionList.svelte';
import { service } from '$lib/test-support/fixtures';
import type { Union, Variant } from '$generated/com-bryzek-apibuilder-spec';

function union(name: string, variants: Variant[]): Union {
  return { name, plural: `${name}s`, variants, attributes: {} };
}

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(unions: Union[]): void {
  component = mount(UnionList, { target, props: { unions, service: service() } });
  flushSync();
}

describe('UnionList', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('renders both kinds of variant', () => {
    render([union('event', [{ type: 'user_created' }, { literal: 'deleted' }] as Variant[])]);

    expect(target.textContent).toContain('user_created');
    expect(target.textContent).toContain('deleted');
    expect(target.textContent).not.toContain('unsupported variant');
  });

  it('marks every variant of a kind it does not know, rather than colliding on one key', () => {
    // `Variant` is dispatched by duck-typing. Keying on `type:${variant.type}` gave every unknown
    // variant the key "type:undefined", so a second one tripped Svelte's duplicate-key check —
    // aborting the render instead of showing the marker written for exactly this case.
    render([union('event', [{ nonsense: 'a' }, { nonsense: 'b' }] as unknown as Variant[])]);

    expect(target.querySelectorAll('td .text-red-600')).toHaveLength(2);
  });
});
