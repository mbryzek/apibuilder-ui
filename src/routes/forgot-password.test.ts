import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockApiClients } from '$lib/test-support/mocks';

/**
 * What forgot-password says when the reset was not sent.
 *
 * The neutral answer exists to hide whether the address has an account, and a definitive refusal
 * — 404, 409, 422 — is exactly what has to stay hidden. An outage is not a refusal: reporting one
 * as success sends the user away to wait for an email that was never sent, on the one screen they
 * reached because they are already locked out.
 */

const client = {
  createTenantSessionPasswordAndResets: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions } = await import('./login/forgot-password/+page.server');

function submit(email: string) {
  const body = new FormData();
  body.append('email', email);
  const event = { request: new Request('http://localhost/', { method: 'POST', body }) };
  return (actions['default'] as (e: typeof event) => Promise<{ success?: boolean; status?: number; data?: unknown }>)(event);
}

beforeEach(() => {
  vi.clearAllMocks();
  client.createTenantSessionPasswordAndResets.mockResolvedValue(undefined);
});

describe('forgot-password hides whether the account exists', () => {
  it('reports success when the reset was accepted', async () => {
    expect(await submit('someone@example.com')).toEqual({ success: true });
  });

  it('reports the same success when the address has no account', async () => {
    client.createTenantSessionPasswordAndResets.mockRejectedValue(
      Object.assign(new Error('Not Found'), { status: 404, response: { status: 404 } })
    );

    expect((await submit('nobody@example.com')).success).toBe(true);
  });
});

describe('forgot-password does not report an outage as a sent email', () => {
  it('surfaces a network failure rather than telling the user to go and wait', async () => {
    client.createTenantSessionPasswordAndResets.mockRejectedValue(new Error('fetch failed'));

    const result = await submit('someone@example.com');

    expect(result.success).toBeUndefined();
    // `actionFail` maps the network sentinel (0) onto 503, which is what an unreachable
    // platform is from the browser's point of view.
    expect(result.status).toBe(503);
  });

  it('surfaces a 5xx the same way', async () => {
    client.createTenantSessionPasswordAndResets.mockRejectedValue(
      Object.assign(new Error('Internal Server Error'), { status: 503, response: { status: 503 } })
    );

    expect((await submit('someone@example.com')).success).toBeUndefined();
  });
});

describe('a refused submission uses a failure status', () => {
  it('answers a blank email with 400 rather than a 200 carrying errors', async () => {
    const result = await submit('   ');

    expect(result.status).toBe(400);
    expect(client.createTenantSessionPasswordAndResets).not.toHaveBeenCalled();
  });
});
