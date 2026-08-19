import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from '$lib/test-support/fixtures';
import { mockApiClients } from '$lib/test-support/mocks';
import { caughtAsync } from '$lib/test-support/throws';

/**
 * What an upload actually sends.
 *
 * The page carried a Visibility select whose value the action read and echoed back into its
 * failure payloads, and never sent: `VersionForm` is `{ original_form }` and carries no
 * visibility, so there was nowhere for the choice to go. A user who picked "public" got whatever
 * default the backend applies, having been told otherwise.
 *
 * This pins the request shape rather than the absent control, because that is the thing that
 * would have to change for the control to be honest — a second call to
 * `updateApplicationByAppKey`, not a field on this one.
 */

const client = {
  getMemberships: vi.fn(),
  updateVersionByVersion: vi.fn()
};

vi.mock('$lib/api/clients', async (importOriginal) => mockApiClients(client, importOriginal));

const { actions } = await import('./[orgKey]/upload/+page.server');

const SPEC = '{"name":"My API","version":"1.2.3"}';

function upload(fields: Record<string, string> = {}) {
  const body = new FormData();
  body.append('file', new File([SPEC], 'api.json', { type: 'application/json' }));
  for (const [k, v] of Object.entries(fields)) {
    body.append(k, v);
  }
  const event = {
    request: new Request('http://localhost/', { method: 'POST', body }),
    locals: { session: session() } as App.Locals,
    params: { orgKey: 'acme' }
  };
  return (actions['default'] as (e: typeof event) => Promise<unknown>)(event);
}

beforeEach(() => {
  vi.clearAllMocks();
  client.getMemberships.mockResolvedValue([{ id: 'membership-1' }]);
  client.updateVersionByVersion.mockResolvedValue({ version: '1.2.3' });
});

describe('an upload sends the spec and nothing else', () => {
  it('posts only the original form, deriving key and version from the spec', async () => {
    expect((await caughtAsync(() => upload())).status).toBe(303);

    expect(client.updateVersionByVersion).toHaveBeenCalledWith({
      orgKey: 'acme',
      appKey: 'my-api',
      version: '1.2.3',
      body: { original_form: { data: SPEC } }
    });
  });

  it('ignores a visibility posted directly, because there is nowhere for it to go', async () => {
    // Not a control the page offers any more. Asserted so that re-adding one has to come with the
    // second call that would make it take effect, rather than silently doing nothing again.
    await caughtAsync(() => upload({ visibility: 'public' }));

    expect(client.updateVersionByVersion).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(client.updateVersionByVersion.mock.calls[0])).not.toContain('public');
  });

  it('still carries the declared format when one is chosen', async () => {
    await caughtAsync(() => upload({ spec_type: 'api_json' }));

    expect(client.updateVersionByVersion).toHaveBeenCalledWith(
      expect.objectContaining({ body: { original_form: { data: SPEC, type: 'api_json' } } })
    );
  });
});
