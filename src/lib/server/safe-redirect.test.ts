import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './safe-redirect';

/**
 * `/\evil.com` is the case that matters: it satisfies the old prefix rule (starts with `/`, does
 * not start with `//`) and still resolves to another origin, because WHATWG URL parsing treats a
 * backslash after the leading slash as a host separator for http(s).
 *
 * These assert the property — "whatever comes back cannot name another origin" — rather than an
 * exact string, so a future implementation is free to normalize differently without the test
 * having to be rewritten to match it.
 */
describe('safeRedirectPath', () => {
  it.each<[string | null | undefined, string]>([
    ['//evil.com', 'protocol-relative'],
    ['/\\evil.com', 'backslash host separator'],
    ['/\\/evil.com', 'backslash then slash'],
    ['\\/evil.com', 'backslash first'],
    ['https://evil.com', 'absolute url'],
    ['evil.com', 'bare host'],
    ['', 'empty'],
    [null, 'null'],
    [undefined, 'undefined']
  ])('does not let %s (%s) name another origin', (payload) => {
    const result = safeRedirectPath(payload);

    expect(result.startsWith('/')).toBe(true);
    expect(new URL(result, 'http://localhost').origin).toBe('http://localhost');
  });

  it.each([
    ['/', '/'],
    ['/gilt', '/gilt'],
    ['/gilt/apidoc?tab=models', '/gilt/apidoc?tab=models'],
    ['/gilt/apidoc/1.0.0#models', '/gilt/apidoc/1.0.0#models']
  ])('preserves the legitimate path %s', (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });
});
