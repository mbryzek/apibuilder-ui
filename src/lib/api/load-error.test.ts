import { describe, expect, it } from 'vitest';
import { dataOr, dataOrThrow, loadErrorFrom, throwIfUnavailable } from './load-error';
import { failed, ok } from '$lib/test-support/api-responses';
import { caught } from '$lib/test-support/throws';

describe('dataOr', () => {
  it('returns the payload of a successful call', () => {
    expect(dataOr(ok(['a']), [])).toEqual(['a']);
  });

  it('returns the fallback when the call failed', () => {
    expect(dataOr(failed(500, 'HTTP 500: Request failed with status 500'), [])).toEqual([]);
  });

  it('keeps a successful empty payload distinct from nothing at all', () => {
    // Both render as an empty list; only the second is accompanied by a load error.
    expect(loadErrorFrom(ok([]))).toBeNull();
    expect(loadErrorFrom(failed(500))).not.toBeNull();
  });
});

describe('loadErrorFrom', () => {
  it('is null when every call succeeded', () => {
    expect(loadErrorFrom(ok(1), ok(2), null)).toBeNull();
  });

  it('reports the first failure and ignores the calls that were never made', () => {
    expect(loadErrorFrom(null, ok(1), failed(403), failed(500))?.status).toBe(403);
  });

  it('uses its own wording for statuses the generated client describes as boilerplate', () => {
    expect(loadErrorFrom(failed(500, 'HTTP 500: Request failed with status 500'))?.message).toBe(
      'We could not reach the server. Please try again in a moment.'
    );
    expect(loadErrorFrom(failed(503, 'HTTP 503: Request failed with status 503'))?.message).toBe(
      'We could not reach the server. Please try again in a moment.'
    );
    expect(loadErrorFrom(failed(401, 'Unauthorized'))?.message).toBe('Your session has expired. Please sign in again.');
    expect(loadErrorFrom(failed(403))?.message).toBe('You do not have permission to view this.');
    expect(loadErrorFrom(failed(429))?.message).toBe('Too many requests. Please wait a moment and try again.');
  });

  it('passes through the message on a network failure, which handleApiCall wrote for a human', () => {
    const message = 'Unable to connect to the server. Please check your internet connection and try again.';
    expect(loadErrorFrom(failed(0, message))).toEqual({ status: 0, message });
  });

  it('passes through validation messages', () => {
    expect(loadErrorFrom(failed(400, 'Offset must be >= 0'))?.message).toBe('Offset must be >= 0');
    expect(loadErrorFrom(failed(409, 'Key is already taken'))?.message).toBe('Key is already taken');
  });

  it('falls back to a generic message when the API sent no usable text', () => {
    expect(loadErrorFrom(failed(400, '   '))?.message).toBe('We could not reach the server. Please try again in a moment.');
    expect(loadErrorFrom(failed(418))?.message).toBe('We could not load this data. Please try again.');
  });
});

describe('throwIfUnavailable', () => {
  it('lets a successful call through', () => {
    expect(() => throwIfUnavailable(ok(1))).not.toThrow();
  });

  it('lets a definitive answer through for the caller to interpret', () => {
    // 401/403/404 mean "no"; only the caller knows whether that is Forbidden or Not found.
    expect(() => throwIfUnavailable(failed(401))).not.toThrow();
    expect(() => throwIfUnavailable(failed(403))).not.toThrow();
    expect(() => throwIfUnavailable(failed(404))).not.toThrow();
  });

  it('stops on a failure that is not an answer', () => {
    expect(caught(() => throwIfUnavailable(failed(500))).status).toBe(500);
    expect(caught(() => throwIfUnavailable(failed(429))).status).toBe(429);
    // status 0 is handleApiCall's network sentinel; SvelteKit's error() only takes 400-599.
    expect(caught(() => throwIfUnavailable(failed(0, 'Unable to connect to the server.'))).status).toBe(503);
  });
});

describe('dataOrThrow', () => {
  it('returns the payload of a successful call', () => {
    expect(dataOrThrow(ok({ key: 'gilt' }), 'Organization not found')).toEqual({ key: 'gilt' });
  });

  it('reports a declined record as missing', () => {
    expect(caught(() => dataOrThrow(failed(404), 'Organization not found'))).toMatchObject({
      status: 404,
      body: { message: 'Organization not found' }
    });
  });

  it('does not confirm a private record exists by the status it returns', () => {
    // 401 and 403 must be indistinguishable from 404 here.
    expect(caught(() => dataOrThrow(failed(401), 'Organization not found')).status).toBe(404);
    expect(caught(() => dataOrThrow(failed(403), 'Organization not found')).status).toBe(404);
  });

  it('does not let an outage masquerade as a missing record', () => {
    expect(caught(() => dataOrThrow(failed(500), 'Organization not found'))).toMatchObject({
      status: 500,
      body: { message: 'We could not reach the server. Please try again in a moment.' }
    });
  });

  it('maps a network failure onto a status an error page can render', () => {
    expect(caught(() => dataOrThrow(failed(0, 'Unable to connect to the server.'), 'Organization not found')).status).toBe(503);
  });
});
