import { describe, expect, it } from 'vitest';
import { humanizedErrors, isUnavailable, messageFor } from './api-message';
import { failed } from '$lib/test-support/api-responses';

describe('isUnavailable', () => {
  it('is true for the failures that are not an answer', () => {
    // 0 is handleApiCall's network sentinel.
    expect([0, 429, 500, 502, 503].map(isUnavailable)).toEqual([true, true, true, true, true]);
  });

  it('is false for an answer the caller has to interpret', () => {
    expect([200, 400, 401, 403, 404, 409, 422].map(isUnavailable)).toEqual([false, false, false, false, false, false, false]);
  });
});

describe('messageFor', () => {
  it('replaces the generated client boilerplate every non-validation failure arrives with', () => {
    expect(messageFor(failed(500, 'HTTP 500: Request failed with status 500'))).toBe(
      'We could not reach the server. Please try again in a moment.'
    );
  });

  it('keeps a message that was written for a human', () => {
    expect(messageFor(failed(422, 'Namespace is already taken'))).toBe('Namespace is already taken');
  });
});

describe('humanizedErrors', () => {
  it('never surfaces the generated client boilerplate', () => {
    expect(humanizedErrors(failed(500, 'HTTP 500: Request failed with status 500'))).toEqual([
      { message: 'We could not reach the server. Please try again in a moment.' }
    ]);
    expect(humanizedErrors(failed(0, 'Unable to connect to the server.'))).toEqual([{ message: 'Unable to connect to the server.' }]);
  });

  it('passes a validation response through whole, fields and all', () => {
    // Every field the form got wrong, not just the first: the user needs to fix all of them.
    const errors = [
      { message: 'Name is required', field: 'name' },
      { message: 'Namespace is required', field: 'namespace' }
    ];
    expect(humanizedErrors(failed(422, ...errors))).toEqual(errors);
  });

  it('says something rather than rendering an empty list of errors', () => {
    // A message-less 400 is still the server having answered. Saying "we could not reach the
    // server" would describe a rejected form as an outage, which is the inversion this module
    // exists to prevent, pointed the other way.
    expect(humanizedErrors(failed(400, '  '))).toEqual([{ message: 'We could not load this data. Please try again.' }]);
    expect(humanizedErrors(failed(409))).toEqual([{ message: 'We could not load this data. Please try again.' }]);
    expect(humanizedErrors(failed(404))).toEqual([{ message: 'We could not find this.' }]);
  });

  it('still calls the network sentinel an outage, because that is what it is', () => {
    expect(humanizedErrors(failed(0))).toEqual([{ message: 'We could not reach the server. Please try again in a moment.' }]);
    expect(humanizedErrors(failed(503))).toEqual([{ message: 'We could not reach the server. Please try again in a moment.' }]);
  });

  it('does not tell a signed-out user their submission was malformed', () => {
    expect(humanizedErrors(failed(401, 'Unauthorized'))).toEqual([{ message: 'Your session has expired. Please sign in again.' }]);
  });
});
