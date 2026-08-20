// @vitest-environment happy-dom

/**
 * What every labelled text input in this app does, asserted once.
 *
 * The field markup used to be copy-pasted per page, so a class or a `for`/`id` pairing could drift
 * on one page alone. These pin the two behaviours that are policy rather than styling: the browser
 * never blocks a submission, and an address field is a text field.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount } from 'svelte';
import FormField from './FormField.svelte';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(props: Record<string, unknown>): { label: HTMLLabelElement; input: HTMLInputElement } {
  component = mount(FormField, { target, props });
  const label = target.querySelector('label');
  const input = target.querySelector('input');
  if (!label || !input) throw new Error('FormField rendered no label/input pair');
  return { label, input };
}

describe('FormField', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(() => {
    if (component) unmount(component);
    component = undefined;
  });

  it('pairs the label with the input, defaulting the id to the name', () => {
    const { label, input } = render({ label: 'Nickname', name: 'nickname' });

    expect(input.id).toBe('nickname');
    expect(label.getAttribute('for')).toBe('nickname');
    expect(label.textContent?.trim()).toBe('Nickname');
  });

  it('lets the id be set independently of the name', () => {
    const { label, input } = render({ label: 'Format', name: 'spec_type', id: 'specType' });

    expect(input.id).toBe('specType');
    expect(input.name).toBe('spec_type');
    expect(label.getAttribute('for')).toBe('specType');
  });

  it('never blocks submission client-side, even where the label is marked required', () => {
    const { label, input } = render({ label: 'Name', name: 'name', markRequired: true });

    expect(input.hasAttribute('required')).toBe(false);
    expect(input.required).toBe(false);
    // The asterisk is what `markRequired` is for: it tells the user, it does not tell the browser.
    expect(label.textContent).toContain('*');
  });

  it('renders an address field as text with an email keyboard', () => {
    const { input } = render({ label: 'Email', name: 'email', inputmode: 'email', autocomplete: 'email' });

    // `type="email"` refuses addresses the platform accepts; the server is the judge.
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputmode')).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('shows the value it is given, which is how a rejected edit survives the round-trip', () => {
    const { input } = render({ label: 'Email', name: 'email', value: 'typed@example.com' });

    expect(input.value).toBe('typed@example.com');
  });

  it('omits the hint line when there is no hint', () => {
    render({ label: 'Key', name: 'key' });
    expect(target.querySelector('p')).toBeNull();

    unmount(component!);
    component = undefined;

    render({ label: 'Key', name: 'key', hint: 'Auto-generated if left blank.' });
    expect(target.querySelector('p')?.textContent).toContain('Auto-generated');
  });
});
