import { describe, it, expect } from 'vitest';
import { getStatusCode, getStatusColorClass } from './responseCode';
import type { Response } from '$generated/com-bryzek-apibuilder-spec';

function resp(code: unknown): Response {
  return { code, type: 'unit' } as Response;
}

describe('getStatusCode', () => {
  it('formats a bare numeric code (the form the backend serves)', () => {
    // Regression: bare numbers previously fell through to '???'
    expect(getStatusCode(resp(200))).toBe('200');
    expect(getStatusCode(resp(400))).toBe('400');
    expect(getStatusCode(resp(204))).toBe('204');
  });

  it('formats a bare string code such as "default"', () => {
    expect(getStatusCode(resp('default'))).toBe('default');
  });

  it('formats the wrapped integer union form', () => {
    expect(getStatusCode(resp({ integer: { value: 201 } }))).toBe('201');
  });

  it('formats the wrapped response_code_option union form', () => {
    expect(getStatusCode(resp({ response_code_option: { value: 'default' } }))).toBe('default');
  });

  it('falls back to ??? for an unrecognized shape', () => {
    expect(getStatusCode(resp({}))).toBe('???');
    expect(getStatusCode(resp(null))).toBe('???');
  });
});

describe('getStatusColorClass', () => {
  it('maps status classes by leading digit', () => {
    expect(getStatusColorClass('200')).toContain('green');
    expect(getStatusColorClass('301')).toContain('blue');
    expect(getStatusColorClass('404')).toContain('yellow');
    expect(getStatusColorClass('500')).toContain('red');
    expect(getStatusColorClass('default')).toContain('gray');
  });
});
