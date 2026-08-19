// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import PendingFormPair from '$lib/test/PendingFormPair.svelte';
import { submitFunctions } from '$lib/test/app-forms';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function button(testid: string): HTMLButtonElement {
  const el = target.querySelector(`[data-testid="${testid}"]`);
  if (!el) throw new Error(`no button rendered for ${testid}`);
  return el as HTMLButtonElement;
}

function render(props: { onSettled?: () => void } = {}): void {
  component = mount(PendingFormPair, { target, props });
  // `use:enhance` is applied by a mount effect, which is queued rather than run inline.
  flushSync();
}

describe('PendingForm', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    submitFunctions.length = 0;
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(() => {
    if (component) unmount(component);
    component = undefined;
  });

  it('leaves a sibling form enabled while one form is in flight', () => {
    render();

    const [submitFirst] = submitFunctions;
    submitFirst!();
    flushSync();

    expect(button('first').disabled).toBe(true);
    // The regression this component exists for: a page-level flag disabled this one too.
    expect(button('second').disabled).toBe(false);
  });

  it('runs onSettled before the page data updates, and clears pending after', async () => {
    const order: string[] = [];
    render({ onSettled: () => order.push('settled') });

    const [submitFirst] = submitFunctions;
    const settled = submitFirst!();
    flushSync();
    expect(button('first').disabled).toBe(true);

    await settled({
      update: async () => {
        order.push('update');
      }
    });
    flushSync();

    expect(button('first').disabled).toBe(false);
    expect(order).toEqual(['settled', 'update']);
  });

  it('keeps the button disabled for the whole of update(), leaving no second-submit window', async () => {
    render();

    const [submitFirst] = submitFunctions;
    const settled = submitFirst!();
    flushSync();

    let disabledDuringUpdate: boolean | undefined;
    await settled({
      // `update()` runs applyAction + invalidateAll — round-trips during which the old markup is
      // still mounted showing the control the user just pressed. On /tokens/create pressing it
      // again mints a second API token, so the flag has to survive this whole callback.
      update: async () => {
        flushSync();
        disabledDuringUpdate = button('first').disabled;
      }
    });
    flushSync();

    expect(disabledDuringUpdate).toBe(true);
    expect(button('first').disabled).toBe(false);
  });
});
