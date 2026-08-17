// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { createRawSnippet, mount, unmount, flushSync } from 'svelte';
import PendingForm from './PendingForm.svelte';
import { submitFunctions } from '$lib/test/app-forms';

const children = createRawSnippet((pending: () => boolean) => ({
  render: () => `<button type="submit" ${pending() ? 'disabled' : ''}>go</button>`,
  setup: () => {}
}));

function button(target: HTMLElement): HTMLButtonElement {
  const el = target.querySelector('button');
  if (!el) throw new Error('no button rendered');
  return el;
}

describe('PendingForm', () => {
  let target: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    submitFunctions.length = 0;
    target = document.createElement('div');
    document.body.append(target);
  });

  it('leaves a sibling form enabled while one form is in flight', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    target.append(first, second);

    const a = mount(PendingForm, { target: first, props: { action: '?/a', children } });
    const b = mount(PendingForm, { target: second, props: { action: '?/b', children } });

    const [submitA] = submitFunctions;
    const settled = submitA!();
    flushSync();

    expect(button(first).disabled).toBe(true);
    expect(button(second).disabled).toBe(false);

    unmount(a);
    unmount(b);
  });

  it('clears pending and runs onSettled before the page data updates', async () => {
    const order: string[] = [];
    const component = mount(PendingForm, {
      target,
      props: { action: '?/a', children, onSettled: () => order.push('settled') }
    });

    const [submit] = submitFunctions;
    const settled = submit!();
    flushSync();
    expect(button(target).disabled).toBe(true);

    await settled({
      update: async () => {
        order.push('update');
      }
    });
    flushSync();

    expect(button(target).disabled).toBe(false);
    expect(order).toEqual(['settled', 'update']);

    unmount(component);
  });
});
