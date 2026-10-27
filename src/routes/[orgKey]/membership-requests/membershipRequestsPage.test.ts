// @vitest-environment happy-dom

/**
 * Two answers to one item: Accept and Decline on a membership request share one request in flight.
 * The clicked button names its verb, the other answer for the same request is disabled until the
 * server's answer has been applied by `update()`, and every other request stays clickable.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Page from './+page.svelte';
import { submitFor } from '#lib/test-support/app-forms.ts';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function request(id: string): Record<string, unknown> {
  return { id, role: 'member', user: { id: `u-${id}`, nickname: `nick-${id}`, email: `${id}@example.com` } };
}

function render(): void {
  const data = {
    org: { key: 'acme', name: 'Acme' },
    requests: [request('r1'), request('r2')],
    offset: 0,
    limit: 25,
    hasMore: false,
    loadError: null
  };
  component = mount(Page, { target, props: { data, form: null } as never });
  flushSync();
}

function button(id: string, act: 'accept' | 'decline'): HTMLButtonElement {
  const form = target.querySelector<HTMLFormElement>(`form[action="?/${act}"]:has(input[value="${id}"])`);
  const el = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!el) throw new Error(`no ${act} button for ${id}`);
  return el;
}

const label = (el: HTMLButtonElement): string | undefined => el.textContent?.trim();

describe('membership requests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('says Accepting… and disables Decline on that request until update() has run', async () => {
    render();
    const settled = await submitFor(button('r1', 'accept'))();
    flushSync();

    expect(label(button('r1', 'accept'))).toBe('Accepting…');
    expect(button('r1', 'accept').disabled).toBe(true);
    expect(label(button('r1', 'decline'))).toBe('Decline');
    expect(button('r1', 'decline').disabled).toBe(true);
    // Another request is a different answer and stays clickable.
    expect(button('r2', 'accept').disabled).toBe(false);
    expect(button('r2', 'decline').disabled).toBe(false);

    let duringUpdate: { label: string | undefined; accept: boolean; decline: boolean } | undefined;
    await settled({
      update: async () => {
        flushSync();
        duringUpdate = {
          label: label(button('r1', 'accept')),
          accept: button('r1', 'accept').disabled,
          decline: button('r1', 'decline').disabled
        };
      }
    });
    flushSync();

    expect(duringUpdate).toEqual({ label: 'Accepting…', accept: true, decline: true });
    expect(label(button('r1', 'accept'))).toBe('Accept');
    expect(button('r1', 'accept').disabled).toBe(false);
    expect(button('r1', 'decline').disabled).toBe(false);
  });

  it('says Declining… on the clicked button and leaves Accept reading Accept, disabled', async () => {
    render();
    const settled = await submitFor(button('r2', 'decline'))();
    flushSync();

    expect(label(button('r2', 'decline'))).toBe('Declining…');
    expect(button('r2', 'decline').disabled).toBe(true);
    expect(label(button('r2', 'accept'))).toBe('Accept');
    expect(button('r2', 'accept').disabled).toBe(true);
    expect(button('r1', 'accept').disabled).toBe(false);

    await settled({ update: async () => {} });
    flushSync();
    expect(label(button('r2', 'decline'))).toBe('Decline');
    expect(button('r2', 'accept').disabled).toBe(false);
  });
});
