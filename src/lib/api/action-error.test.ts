import { describe, expect, it } from 'vitest';
import { actionFail, actionFailMissing } from './action-error';
import type { ApiError } from './error-handler';
import { failed } from '$lib/test-support/api-responses';

/** SvelteKit's `ActionFailure`, as a page's `form` prop sees it. */
function result(failure: { status: number; data: unknown }): { status: number; data: { errors: ApiError[] } } {
  return failure as { status: number; data: { errors: ApiError[] } };
}

describe('actionFail', () => {
  it('never shows the generated client boilerplate to the person who submitted the form', () => {
    // The whole point: `HTTP 500: Request failed with status 500` was what an org admin saw
    // after clicking Add Domain while the platform was down.
    expect(result(actionFail(failed(500, 'HTTP 500: Request failed with status 500'))).data.errors).toEqual([
      { message: 'We could not reach the server. Please try again in a moment.' }
    ]);
  });

  it('keeps the validation messages the API wrote for the form', () => {
    const errors = [{ message: 'Key is already taken', field: 'key' }];
    expect(result(actionFail({ status: 422, errors })).data.errors).toEqual(errors);
  });

  it('records an outage as an outage rather than as a client mistake', () => {
    // 13 call sites hardcoded fail(400), so every 5xx was logged as a bad request.
    expect(result(actionFail(failed(503))).status).toBe(503);
    expect(result(actionFail(failed(429))).status).toBe(429);
    expect(result(actionFail(failed(422))).status).toBe(422);
  });

  it('maps a status no form failure can carry onto one that says the same thing', () => {
    // 0 is the network sentinel; Math.max(status, 400) filed it as a client error.
    expect(result(actionFail(failed(0, 'Unable to connect to the server.'))).status).toBe(503);
    expect(result(actionFail(failed(302))).status).toBe(400);
  });

  it('carries the fields a page re-renders its form from', () => {
    const failure = actionFail(failed(500), { email: 'a@b.com', name: 'A' });
    expect(failure.data).toMatchObject({ email: 'a@b.com', name: 'A' });
    expect(failure.data.errors).toHaveLength(1);
  });
});

describe('actionFailMissing', () => {
  it('uses the caller wording when the API answered', () => {
    expect(result(actionFailMissing(failed(404), 'Organization not found')).data.errors).toEqual([{ message: 'Organization not found' }]);
    expect(result(actionFailMissing({ status: 200, data: [] }, 'User not found: nobody')).data.errors).toEqual([
      { message: 'User not found: nobody' }
    ]);
  });

  it('does not let an outage masquerade as a missing record', () => {
    // "Organization not found" while the platform is down sends an admin to check a spelling.
    const failure = result(actionFailMissing(failed(503, 'HTTP 503: Request failed with status 503'), 'Organization not found'));
    expect(failure.data.errors).toEqual([{ message: 'We could not reach the server. Please try again in a moment.' }]);
    expect(failure.status).toBe(503);
  });
});
