// @vitest-environment happy-dom

/**
 * The badge in front of a documentation heading, alone and through the heading that composes it.
 * A svelte file cannot be handed a snippet from a test without `createRawSnippet`.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRawSnippet, mount, unmount } from 'svelte';
import SectionHeading from './SectionHeading.svelte';
import StepBadge from './StepBadge.svelte';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

describe('doc headings', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('StepBadge renders what it is given in the one badge size', () => {
    component = mount(StepBadge, { target, props: { children: text('1') } });
    const badge = target.firstElementChild;

    expect(badge?.textContent).toBe('1');
    expect(badge?.classList.contains('h-7')).toBe(true);
    expect(badge?.classList.contains('bg-ab-blue')).toBe(true);
  });

  it('StepBadge marks a step outside the sequence as muted', () => {
    component = mount(StepBadge, { target, props: { muted: true, children: text('0') } });
    const badge = target.firstElementChild;

    expect(badge?.classList.contains('bg-gray-400')).toBe(true);
    expect(badge?.classList.contains('bg-ab-blue')).toBe(false);
  });

  it('SectionHeading is an h2 holding the badge, then the title', () => {
    component = mount(SectionHeading, { target, props: { badge: '2', children: text('Reference a Scheme') } });
    const heading = target.querySelector('h2');

    expect(heading?.querySelector('.bg-ab-blue')?.textContent).toBe('2');
    expect(heading?.textContent).toContain('Reference a Scheme');
  });

  it('SectionHeading takes the level a page outline needs', () => {
    component = mount(SectionHeading, { target, props: { badge: 'T', level: 3, children: text('TypeScript') } });

    expect(target.querySelector('h3')?.textContent).toContain('TypeScript');
    expect(target.querySelector('h2')).toBeNull();
  });
});
