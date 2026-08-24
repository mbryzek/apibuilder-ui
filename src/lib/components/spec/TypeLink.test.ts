// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import TypeLink from './TypeLink.svelte';
import { service } from '$lib/test-support/fixtures';
import type { Service } from '$generated/com-bryzek-apibuilder-spec';

const model = (name: string) => ({ name, plural: `${name}s`, fields: [], attributes: {} });

const svc = service({
  models: [model('user')],
  imports: [
    service({
      namespace: 'io.flow.common.v0.models',
      organization: { key: 'flow' },
      application: { key: 'common' },
      version: '0.1.0'
    })
  ]
});

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(typeStr: string, s: Service = svc): void {
  component = mount(TypeLink, { target, props: { typeStr, service: s } });
  flushSync();
}

function text(): string {
  return target.textContent!.trim();
}

describe('TypeLink', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('renders a bare type', () => {
    render('string');
    expect(text()).toBe('string');
  });

  it.each([
    ['[user]', '[user]'],
    ['map[user]', 'map[user]'],
    ['map[[user]]', 'map[[user]]'],
    ['[map[user]]', '[map[user]]']
  ])('renders %s with its containers back in order', (typeStr, expected) => {
    render(typeStr);
    expect(text()).toBe(expected);
    // Still the inner type that is linked, however deep it sits.
    expect(target.querySelector('a')?.getAttribute('href')).toBe('#user');
  });

  it('shows a nested imported type by its short name, linked', () => {
    render('map[[io.flow.common.v0.models.price]]');

    expect(text()).toBe('map[[price]]');
    expect(target.querySelector('a')?.getAttribute('href')).toBe('/flow/common/0.1.0#price');
  });
});
