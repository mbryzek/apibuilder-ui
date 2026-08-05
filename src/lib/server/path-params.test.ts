import { describe, expect, it } from 'vitest';
import { assertSafePathParams, assertSafeSegment } from './path-params';

/** The `HttpError` SvelteKit's `error()` throws. */
function caught(fn: () => unknown): { status: number; body: { message: string } } {
  try {
    fn();
  } catch (thrown) {
    return thrown as { status: number; body: { message: string } };
  }
  throw new Error('expected the call to throw');
}

describe('assertSafeSegment', () => {
  it('accepts the key shapes the registry actually serves', () => {
    // Sampled from the live API: generator keys, semver versions, the `latest` alias.
    for (const value of ['gilt', 'apidoc', 'play_2_x_routes', 'psql_scala', '1.0.0', '0.2.1-dev', '1.0.0+build1', 'latest', 'a~b']) {
      expect(() => assertSafeSegment(value, 'version')).not.toThrow();
    }
  });

  it('rejects the delimiters that would retarget the upstream request', () => {
    // Each of these reached the upstream URL because SvelteKit decodes params before we see them
    // and the generated client interpolates them raw.
    for (const value of ['../../../users', 'a/b', '1.0.0?limit=999', 'a#b', 'a%2Fb', 'a\\b', 'http://evil', 'a b']) {
      expect(caught(() => assertSafeSegment(value, 'version')).status).toBe(400);
    }
  });

  it('rejects the traversal segments that satisfy the character class', () => {
    // `.` and `..` are made only of allowed characters and still traverse:
    // /apibuilder/org/app/.. normalizes to /apibuilder/org.
    expect(caught(() => assertSafeSegment('..', 'version')).status).toBe(400);
    expect(caught(() => assertSafeSegment('.', 'version')).status).toBe(400);
  });

  it('rejects an empty segment and names the offending param', () => {
    expect(caught(() => assertSafeSegment('', 'generatorKey'))).toMatchObject({
      status: 400,
      body: { message: 'Invalid generatorKey' }
    });
  });
});

describe('assertSafePathParams', () => {
  it('passes a well-formed request through', () => {
    expect(() => assertSafePathParams({ orgKey: 'gilt', appKey: 'apidoc', version: '1.0.0', generatorKey: 'psql_scala' })).not.toThrow();
  });

  it('checks only the params the route actually has', () => {
    expect(() => assertSafePathParams({ orgKey: 'gilt' })).not.toThrow();
    expect(() => assertSafePathParams({})).not.toThrow();
  });

  it('ignores params that are not interpolated into the upstream path', () => {
    // typeName is encoded by the example endpoint itself, and `[user]` is a legitimate type name.
    expect(() => assertSafePathParams({ orgKey: 'gilt', typeName: '[user]' })).not.toThrow();
  });

  it('rejects a bad param wherever it appears', () => {
    expect(caught(() => assertSafePathParams({ orgKey: 'gilt', appKey: '../../admin' })).status).toBe(400);
    expect(caught(() => assertSafePathParams({ orgKey: 'gilt', version: '1.0.0?limit=999' })).status).toBe(400);
  });
});
