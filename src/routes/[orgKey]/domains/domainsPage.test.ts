// @vitest-environment happy-dom

/**
 * A plain form and a confirmation on the domains page. Add Domain reads Adding… while its request is
 * on its way; Confirm reads Removing… with its Cancel disabled, so nothing can send a second answer or
 * withdraw the confirmation until `update()` has applied the server's answer.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Page from './+page.svelte';
import { submitFor } from '#lib/test-support/app-forms.ts';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(): void {
  const data = { org: { key: 'acme', name: 'Acme', domains: [{ name: 'acme.com' }] }, isAdmin: true };
  component = mount(Page, { target, props: { data, form: null } as never });
  flushSync();
}

function buttonNamed(text: string): HTMLButtonElement {
  const el = [...target.querySelectorAll('button')].find((b) => b.textContent?.trim() === text);
  if (!el) throw new Error(`no button reading ${text}`);
  return el;
}

const addButton = (): HTMLButtonElement => target.querySelector<HTMLButtonElement>('form[action="?/addDomain"] button[type="submit"]')!;

describe('domains', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('says Adding… and disables Add Domain until update() has run', async () => {
    render();
    const settled = await submitFor(addButton())();
    flushSync();
    expect(addButton().textContent?.trim()).toBe('Adding…');
    expect(addButton().disabled).toBe(true);

    let disabledDuringUpdate: boolean | undefined;
    await settled({
      update: async () => {
        flushSync();
        disabledDuringUpdate = addButton().disabled;
      }
    });
    flushSync();

    expect(disabledDuringUpdate).toBe(true);
    expect(addButton().textContent?.trim()).toBe('Add Domain');
    expect(addButton().disabled).toBe(false);
  });

  it('says Removing… and disables Cancel, and keeps the row disabled until update() has run', async () => {
    render();
    buttonNamed('Remove').click();
    flushSync();

    const settled = await submitFor(buttonNamed('Confirm'))();
    flushSync();
    expect(buttonNamed('Removing…').disabled).toBe(true);
    expect(buttonNamed('Cancel').disabled).toBe(true);

    let duringUpdate: { label: string | undefined; disabled: boolean } | undefined;
    await settled({
      update: async () => {
        flushSync();
        // onSettled has closed the confirmation; the row's Remove still says the removal is on its way.
        const remove = target.querySelector<HTMLButtonElement>('button[type="button"]')!;
        duringUpdate = { label: remove.textContent?.trim(), disabled: remove.disabled };
      }
    });
    flushSync();

    expect(duringUpdate).toEqual({ label: 'Removing…', disabled: true });
    expect(buttonNamed('Remove').disabled).toBe(false);
  });
});
