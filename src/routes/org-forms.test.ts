import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invokeAction } from '#lib/test-support/invoke-action.ts';
import { caughtAsync } from '#lib/test-support/throws.ts';

/**
 * The organization create and edit forms against a refusal.
 *
 * A refused submission comes back carrying what was typed, so a full-page submission re-renders the
 * reader's values rather than an empty form (create) or the saved organization (edit), as FormField
 * asks of every caller. And create meets an unanswered session lookup with the shared guard's 503,
 * never the /login redirect that drops the form.
 */

const SESSION = { id: 'session-1', user: { id: 'someone' } };

const client = {
  createOrganization: vi.fn(),
  updateOrganizationByKey: vi.fn()
};

vi.mock('#lib/api/clients.ts', () => ({
  apiBuilderClient: () => client,
  getSessionHeaders: () => ({})
}));

// Only the org-scoped guard is stubbed; `requireAuthForAction` is the real one under test.
vi.mock('#lib/server/auth.ts', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  adminClient: async () => ({ session: SESSION, client })
}));

const { actions: createActions } = await import('./org/create/+page.server');
const { actions: detailsActions } = await import('./[orgKey]/details/+page.server');

const TYPED = { name: 'Acme', namespace: 'com.acme', key: 'acme', visibility: 'public' };

function invoke(action: unknown, form: Record<string, string>, locals: App.Locals = { session: SESSION as never }) {
  return invokeAction(action, { form, locals, params: { orgKey: 'acme' }, cookies: { set: () => {} } });
}

const conflict = () => Object.assign(new Error('Conflict'), { status: 409, response: new Response(null, { status: 409 }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('create organization', () => {
  it('answers 503 when the session lookup got no answer, rather than sending a signed-in user to /login', async () => {
    const thrown = await caughtAsync(() => invoke(createActions['default'], TYPED, { sessionUnavailable: true }));

    expect(thrown.status).toBe(503);
    expect(client.createOrganization).not.toHaveBeenCalled();
  });

  it('still sends a request that has no session to /login', async () => {
    const thrown = await caughtAsync(() => invoke(createActions['default'], TYPED, {}));

    expect(thrown.status).toBe(302);
    expect(thrown.location).toBe('/login');
  });

  it('hands back what was typed with a refusal from the API', async () => {
    client.createOrganization.mockRejectedValue(conflict());

    const result = await invoke(createActions['default'], TYPED);

    expect(result).toMatchObject({ status: 409, data: TYPED });
  });

  it('hands back what was typed with a refusal of its own', async () => {
    const result = await invoke(createActions['default'], { ...TYPED, namespace: ' ' });

    expect(result).toMatchObject({ status: 400, data: { name: 'Acme', namespace: '', key: 'acme', visibility: 'public' } });
  });
});

describe('edit organization', () => {
  it('hands back what was typed with a refusal from the API, not the saved organization', async () => {
    client.updateOrganizationByKey.mockRejectedValue(conflict());

    const result = await invoke(detailsActions['update'], TYPED);

    expect(result).toMatchObject({ status: 409, data: TYPED });
  });
});
