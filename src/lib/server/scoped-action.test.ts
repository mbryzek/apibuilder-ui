import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '$lib/test-support/fixtures';
import { actionEvent } from '$lib/test-support/invoke-action';

/**
 * `adminGuidAction` is the confused-deputy guard every guid-scoped admin action is built on, so
 * its order is the contract: authorize, then read the guid, then resolve it in the org's listing,
 * and only then act — on the row the listing returned, never on the value from the form.
 */

const SESSION = session({ user: { id: 'admin-1' } });
const client = { marker: 'client' };
const adminClient = vi.fn();

vi.mock('$lib/server/auth', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  adminClient: (...args: unknown[]) => adminClient(...args)
}));

const { adminGuidAction, INVALID_REQUEST } = await import('./scoped-action');

type Row = { id: string };

function event(form: Record<string, string>) {
  return actionEvent({ form, locals: {} as App.Locals, params: { orgKey: 'my-org' } });
}

const listing = vi.fn();
const scope = vi.fn((_client: unknown, _orgKey: string) => listing);
const act = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  adminClient.mockResolvedValue({ session: SESSION, client });
  listing.mockResolvedValue({ status: 200, data: [{ id: 'row-1' }] });
  act.mockResolvedValue(undefined);
});

describe('adminGuidAction', () => {
  it('acts on the row the org listing returned, with the authorized client', async () => {
    expect(await adminGuidAction<Row>(event({ guid: ' row-1 ' }), scope, act)).toEqual({ success: true });
    expect(adminClient).toHaveBeenCalledWith({}, 'my-org');
    expect(scope).toHaveBeenCalledWith(client, 'my-org');
    expect(act).toHaveBeenCalledWith({ id: 'row-1' }, client);
  });

  it('authorizes before reading the form, so a refused caller never reaches the scan', async () => {
    adminClient.mockRejectedValue(new Error('forbidden'));
    await expect(adminGuidAction<Row>(event({ guid: 'row-1' }), scope, act)).rejects.toThrow('forbidden');
    expect(listing).not.toHaveBeenCalled();
    expect(act).not.toHaveBeenCalled();
  });

  it('refuses a blank guid with 400 before scanning', async () => {
    expect(await adminGuidAction<Row>(event({ guid: '  ' }), scope, act)).toMatchObject({
      status: 400,
      data: { errors: [{ message: INVALID_REQUEST }] }
    });
    expect(listing).not.toHaveBeenCalled();
  });

  it('answers 404 for a guid outside the org and never acts', async () => {
    expect(await adminGuidAction<Row>(event({ guid: 'someone-elses' }), scope, act)).toMatchObject({ status: 404 });
    expect(act).not.toHaveBeenCalled();
  });

  it('surfaces a failed act as an action failure', async () => {
    act.mockRejectedValue(new Error('fetch failed'));
    expect(await adminGuidAction<Row>(event({ guid: 'row-1' }), scope, act)).toMatchObject({
      data: { errors: [{ message: expect.any(String) }] }
    });
  });
});
