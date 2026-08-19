// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync, type ComponentProps } from 'svelte';
import SpecTabs from './SpecTabs.svelte';
import { operation, service } from '$lib/test-support/fixtures';
import type { Enum, Model, Resource } from '$generated/com-bryzek-apibuilder-spec';

function model(name: string): Model {
  return { name, plural: `${name}s`, fields: [], attributes: {} };
}

function enumeration(name: string): Enum {
  return { name, plural: `${name}s`, values: [], attributes: {} };
}

function resource(type: string): Resource {
  return { type, plural: `${type}s`, operations: [operation()], attributes: {} };
}

/** A service with something in three of the tabbed sections, so a filter has somewhere to miss. */
const populated = service({
  resources: [resource('event')],
  models: [model('user')],
  enums: [enumeration('status')]
});

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(props: ComponentProps<typeof SpecTabs>): void {
  component = mount(SpecTabs, { target, props });
  flushSync();
}

function tabLabels(): string[] {
  return [...target.querySelectorAll('[role="tab"]')].map((el) => el.textContent!.trim().split(/\s+/)[0]!);
}

describe('SpecTabs', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(() => {
    if (component) unmount(component);
    component = undefined;
  });

  it('shows a tab per non-empty section and opens the first of them', () => {
    render({ service: populated });

    expect(tabLabels()).toEqual(['Resources', 'Models', 'Enums']);
    expect(target.textContent).toContain('event');
  });

  it('narrows the tabs to the sections a filter matches', () => {
    render({ service: populated, searchQuery: 'use' });

    expect(tabLabels()).toEqual(['Models']);
    expect(target.textContent).toContain('user');
    expect(target.textContent).not.toContain('event');
  });

  it('says the filter matched nothing rather than that the service declares nothing', () => {
    // The regression: with no tab left to select, the content block fell back to `resources` and
    // an empty ResourceList reported "No resources defined." for a service that has one.
    render({ service: populated, searchQuery: 'nosuchtype' });

    expect(target.textContent).toContain('No types match "nosuchtype".');
    expect(target.textContent).not.toContain('No resources defined.');
    expect(tabLabels()).toEqual([]);
  });

  it('still reports a service that genuinely declares nothing', () => {
    render({ service: service() });

    expect(target.textContent).toContain('No resources defined.');
    expect(target.textContent).not.toContain('No types match');
  });
});
