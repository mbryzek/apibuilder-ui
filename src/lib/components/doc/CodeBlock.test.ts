// @vitest-environment happy-dom

/**
 * What a code sample on a documentation page renders. A sample is text unless its call site opts
 * in, so a sample showing angle brackets shows them; children are what keep the field types and
 * links of the api.json reference as markup.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRawSnippet, mount, unmount, type ComponentProps } from 'svelte';
import CodeBlock from './CodeBlock.svelte';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(props: ComponentProps<typeof CodeBlock>): { pre: HTMLPreElement; code: HTMLElement } {
  component = mount(CodeBlock, { target, props });
  const pre = target.querySelector('pre');
  const code = pre?.querySelector('code');
  if (!pre || !code) throw new Error('CodeBlock rendered no pre/code pair');
  return { pre, code };
}

describe('CodeBlock', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('renders the sample as text, so markup in it is shown rather than parsed', () => {
    const sample = '<your-org>:\n  - <em>generators</em> & "more"';
    const { code } = render({ code: sample });

    expect(code.textContent).toBe(sample);
    expect(code.querySelector('em')).toBeNull();
    expect(code.querySelector('your-org')).toBeNull();
  });

  it('renders markup only where the call site passes it as children', () => {
    const markup = createRawSnippet(() => ({ render: () => '<span>"name": <em>string</em>, <a href="#info">Info</a></span>' }));
    const { code } = render({ children: markup });

    expect(code.querySelector('em')?.textContent).toBe('string');
    expect(code.querySelector('a')?.getAttribute('href')).toBe('#info');
    expect(code.textContent).toBe('"name": string, Info');
  });

  it('adds no whitespace around the sample, which a pre would show', () => {
    const { pre } = render({ code: 'api' });

    expect(pre.textContent).toBe('api');
  });

  it('adds the call site class to its own', () => {
    const { pre } = render({ code: 'api', class: 'mb-4' });

    expect(pre.classList.contains('mb-4')).toBe(true);
    expect(pre.classList.contains('border-gray-200')).toBe(true);
  });
});
