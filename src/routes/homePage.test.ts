// @vitest-environment happy-dom

/**
 * The home page, for the two audiences it has. A signed-out visitor has no credential to read
 * anything with, so the load makes no API call, and a failure it never risks cannot put a banner
 * under the hero. A signed-in member's memberships read keeps reporting its failure.
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Page from './+page.svelte';
import { session } from '#lib/test-support/fixtures.ts';
import { mockApiClients } from '#lib/test-support/mocks.ts';

const client = vi.hoisted(() => ({
  getOrganizations: vi.fn(),
  getMemberships: vi.fn()
}));

vi.mock('#lib/api/clients.ts', (importOriginal) => mockApiClients(client, importOriginal));

const { load } = await import('./+page.server');
const { apiBuilderClient } = await import('#lib/api/clients.ts');

function unauthorized(): never {
  throw Object.assign(new Error('User is not logged in'), { response: { status: 401 } });
}

function invokeLoad(locals: Partial<App.Locals>): ReturnType<typeof load> {
  return load({ locals } as never);
}

describe('home page load', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.getOrganizations.mockImplementation(unauthorized);
    client.getMemberships.mockImplementation(unauthorized);
  });

  it('makes no API call and returns no loadError with no session', async () => {
    const data = await invokeLoad({});

    expect(apiBuilderClient).not.toHaveBeenCalled();
    expect(client.getOrganizations).not.toHaveBeenCalled();
    expect(client.getMemberships).not.toHaveBeenCalled();
    expect(data).toMatchObject({ loadError: null });
  });

  it('reads the memberships of a signed-in member and reports a failure', async () => {
    const data = await invokeLoad({ session: session() });

    expect(client.getMemberships).toHaveBeenCalledWith({ userId: 'user-1', limit: 100, offset: 0 });
    expect(data).toMatchObject({ myOrgs: [], loadError: { status: 401 } });
  });
});

describe('home page', () => {
  let target: HTMLElement;
  let component: Record<string, unknown> | undefined;

  function render(data: Record<string, unknown>): void {
    component = mount(Page, { target, props: { data } as never });
    flushSync();
  }

  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.append(target);
  });

  afterEach(async () => {
    if (component) await unmount(component);
    component = undefined;
  });

  it('shows a signed-out visitor the hero with no banner and no public organizations section', () => {
    render({ myOrgs: [], loadError: null });

    expect(target.querySelector('h1')?.textContent).toBe('API Builder');
    expect(target.querySelector('[role="alert"]')).toBeNull();
    expect(target.textContent).not.toMatch(/public organizations/i);
  });

  it('shows a signed-in member the banner when the memberships read failed', () => {
    render({
      session: { user: { id: 'user-1' } },
      myOrgs: [],
      loadError: { status: 500, message: 'The server had a problem.' }
    });

    expect(target.querySelector('[role="alert"]')?.textContent).toContain('The server had a problem.');
    expect(target.querySelector('h1')?.textContent).toBe('My Organizations');
  });
});
