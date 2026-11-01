// @vitest-environment happy-dom

/**
 * The search field belongs to the reader. The load a pause in typing started lands while they keep
 * typing, and it must not write its own `q` back over what they have typed since.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { reactiveProps } from '#lib/test-support/reactive.svelte.ts';

const goto = vi.fn(async (_url: string, _opts?: unknown) => {});
vi.mock('$app/navigation', () => ({ goto, refreshAll: async () => {}, afterNavigate: () => {} }));

const { default: Page } = await import('./+page.svelte');

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

const props = reactiveProps({ data: { items: [], q: '', offset: 0, limit: 25, hasMore: false, loadError: null } });

function serve(q: string): void {
  props.data = { ...props.data, q };
  flushSync();
}

const field = (): HTMLInputElement => target.querySelector<HTMLInputElement>('input[name="q"]')!;

function type(text: string): void {
  field().value = text;
  field().dispatchEvent(new Event('input', { bubbles: true }));
  flushSync();
}

describe('search field', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    goto.mockClear();
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
    props.data = { ...props.data, q: '' };
    component = mount(Page, { target, props: props as never });
    flushSync();
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
    vi.useRealTimers();
  });

  it('keeps what the reader typed while the load they started lands', () => {
    type('auth');
    vi.advanceTimersByTime(250);
    expect(goto).toHaveBeenLastCalledWith('/search?q=auth', { reset: false, replace: true });

    type('authen');
    serve('auth');

    expect(field().value).toBe('authen');
    vi.advanceTimersByTime(250);
    expect(goto).toHaveBeenLastCalledWith('/search?q=authen', { reset: false, replace: true });
  });

  it('shows the query of a navigation the field did not start', () => {
    type('auth');
    vi.advanceTimersByTime(250);
    serve('auth');

    serve('billing');

    expect(field().value).toBe('billing');
  });

  it('drops a pending search when another navigation lands first', () => {
    type('auth');
    serve('billing');
    vi.advanceTimersByTime(250);

    expect(goto).not.toHaveBeenCalled();
    expect(field().value).toBe('billing');
  });

  it('gives a submitted search a history entry of its own', () => {
    type('auth');
    target.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    flushSync();

    expect(goto).toHaveBeenCalledTimes(1);
    expect(goto).toHaveBeenLastCalledWith('/search?q=auth', { reset: false, replace: false });
  });
});
