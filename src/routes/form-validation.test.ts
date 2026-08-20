import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockServerAuth } from '$lib/test-support/mocks';

/**
 * What the actions do with a field that was not filled in.
 *
 * These assert the wiring rather than `$lib/server/form`, which has its own unit tests: the rule
 * being checked is that an action reads its fields through those helpers, so a submission the
 * form itself cannot produce — an absent field, a field of spaces, an enum value outside the enum
 * — is refused here instead of being forwarded to the API as though somebody had typed it.
 *
 * The password case is the other direction, and is the reason `requiredSecret` exists: trimming a
 * password would lock out every account whose password begins or ends with a space, silently.
 */

const SESSION = { id: 'session-1', user: { id: 'someone' } };

const client = {
  updateOrganizationByKey: vi.fn(),
  getMemberships: vi.fn(),
  deleteMembershipById: vi.fn(),
  createTenantSessionLogins: vi.fn()
};

vi.mock('$lib/api/clients', () => ({
  apiBuilderClient: () => client,
  platformClient: () => client,
  clients: () => ({ platform: client, apiBuilder: client }),
  getSessionHeaders: () => ({})
}));

vi.mock('$lib/server/auth', async (importOriginal) => mockServerAuth(SESSION, client, importOriginal));

/** The login action's success path sets a cookie and redirects; the calls are what matter here. */
vi.mock('$lib/server/auth-completion', () => ({
  completeSession: () => ({ completed: true })
}));

const { actions: detailsActions } = await import('./[orgKey]/details/+page.server');
const { actions: memberActions } = await import('./[orgKey]/members/+page.server');
const { actions: loginActions } = await import('./login/+page.server');

/** Invoke an action the way SvelteKit would, with only the fields these actions read. */
function invoke(action: unknown, form: Record<string, string>) {
  const body = new FormData();
  for (const [name, value] of Object.entries(form)) {
    body.append(name, value);
  }
  const event = {
    request: new Request('http://localhost/', { method: 'POST', body }),
    locals: { session: SESSION },
    params: { orgKey: 'my-org' },
    url: new URL('http://localhost/login'),
    // Real cookie methods: the success path sets a one-shot flash cookie before redirecting.
    cookies: { get: () => undefined, set: () => {}, delete: () => {} }
  };
  return (action as (e: typeof event) => Promise<unknown>)(event);
}

/** `redirectWithFlash` throws on the success path, as every SvelteKit redirect does. */
async function ignoringRedirect(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (thrown) {
    if (!(thrown && typeof thrown === 'object' && 'status' in thrown)) {
      throw thrown;
    }
  }
}

function expectRefusal(result: unknown, message: string) {
  expect(result).toMatchObject({ status: 400, data: { errors: [{ message }] } });
}

beforeEach(() => {
  vi.clearAllMocks();
  client.updateOrganizationByKey.mockResolvedValue({ key: 'my-org' });
  client.getMemberships.mockResolvedValue([{ id: 'membership-1' }]);
  client.createTenantSessionLogins.mockResolvedValue({ discriminator: 'tenant_session', session: { id: 'new-session' } });
});

describe('a required field of nothing but whitespace is not a filled-in field', () => {
  it('refuses an organization update whose namespace is spaces', async () => {
    const result = await invoke(detailsActions['update'], {
      name: 'My Org',
      namespace: '   ',
      visibility: 'organization'
    });

    expectRefusal(result, 'Name and namespace are required');
    expect(client.updateOrganizationByKey).not.toHaveBeenCalled();
  });

  it('refuses a member removal whose guid is spaces, rather than scanning for a blank id', async () => {
    const result = await invoke(memberActions['removeMember'], { guid: '  ' });

    expectRefusal(result, 'Invalid request');
    expect(client.getMemberships).not.toHaveBeenCalled();
  });

  it('trims a value that was filled in, so a stray space is not part of the name', async () => {
    await ignoringRedirect(() =>
      invoke(detailsActions['update'], { name: '  My Org  ', namespace: ' my.org ', visibility: 'organization' })
    );

    expect(client.updateOrganizationByKey).toHaveBeenCalledWith(
      expect.objectContaining({ body: { name: 'My Org', namespace: 'my.org', visibility: 'organization' } })
    );
  });
});

describe('an enum field carries a value of the enum or the submission is refused', () => {
  it('refuses a visibility outside the enum instead of forwarding it to the API', async () => {
    const result = await invoke(detailsActions['update'], { name: 'My Org', namespace: 'my.org', visibility: 'everyone' });

    expectRefusal(result, 'Visibility is required');
    expect(client.updateOrganizationByKey).not.toHaveBeenCalled();
  });

  it('refuses an absent visibility, which the generated form type requires', async () => {
    const result = await invoke(detailsActions['update'], { name: 'My Org', namespace: 'my.org' });

    expectRefusal(result, 'Visibility is required');
    expect(client.updateOrganizationByKey).not.toHaveBeenCalled();
  });
});

describe('a password is submitted exactly as it was typed', () => {
  it('does not trim the password, and does trim the email beside it', async () => {
    await invoke(loginActions['default'], { email: '  someone@example.com ', password: '  spaces both ends  ' });

    expect(client.createTenantSessionLogins).toHaveBeenCalledWith(
      expect.objectContaining({ body: { email: 'someone@example.com', password: '  spaces both ends  ' } })
    );
  });

  it('refuses a password of nothing at all', async () => {
    const result = await invoke(loginActions['default'], { email: 'someone@example.com', password: '' });

    expectRefusal(result, 'Email and password are required');
    expect(client.createTenantSessionLogins).not.toHaveBeenCalled();
  });
});
