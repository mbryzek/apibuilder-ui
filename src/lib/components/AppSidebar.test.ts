// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import AppSidebar from './AppSidebar.svelte';
import { page } from '#lib/test-support/app-state.svelte.ts';
import type { Generator } from '#generated/com-bryzek-apibuilder-generator.ts';

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function render(generators: Generator[]): void {
  component = mount(AppSidebar, {
    target,
    props: { orgKey: 'acme', appKey: 'api', version: '1.0.0', appName: 'API', isMember: false, isAdmin: false, generators }
  });
  flushSync();
}

/** The desktop sidebar; the mobile one renders the same links only once its menu is opened. */
const sidebar = (): Element => target.querySelectorAll('nav')[1]!;

const clientLink = (href: string): Element | null => sidebar().querySelector(`a[href="${href}"]`);

describe('AppSidebar Clients section', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('links each generator to its generated code for this version, not to the catalog', () => {
    render([
      { key: 'play_client', name: 'Play client' },
      { key: 'ts', name: 'TypeScript' }
    ]);

    expect(sidebar().textContent).toContain('Clients');
    expect(clientLink('/acme/api/1.0.0/play_client')?.textContent?.trim()).toBe('Play client');
    expect(clientLink('/acme/api/1.0.0/ts')?.textContent?.trim()).toBe('TypeScript');
  });

  it('does not preload a client link, since opening one runs the generator', () => {
    render([{ key: 'ts', name: 'TypeScript' }]);

    expect(clientLink('/acme/api/1.0.0/ts')?.getAttribute('data-sveltekit-preload-data')).toBe('false');
  });

  it('renders no section without generators', () => {
    render([]);

    expect(sidebar().textContent).not.toContain('Clients');
  });

  it('marks the generator being read as current', () => {
    page.url = new URL('http://localhost/acme/api/1.0.0/ts');
    render([{ key: 'ts', name: 'TypeScript' }]);

    expect(clientLink('/acme/api/1.0.0/ts')?.className).toContain('bg-ab-blue');
  });
});
