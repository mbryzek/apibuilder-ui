import { describe, it, expect } from 'vitest';
import { activationOutcome } from './activationOutcome';
import type { UserActivation } from '#generated/com-bryzek-platform.ts';

function activation(fields: Partial<UserActivation> = {}): UserActivation {
  return {
    user: { id: 'usr-1' },
    expires_at: '2026-10-01T00:00:00Z',
    ...fields
  };
}

describe('activationOutcome', () => {
  it('is ready, carrying the greeting, when the platform holds the activation', () => {
    expect(
      activationOutcome({ data: activation({ name: 'Casey', email: { id: 'eml-1', address: 'casey@example.com' } }), status: 200 })
    ).toEqual({ kind: 'ready', name: 'Casey', email: 'casey@example.com' });
  });

  it('is ready with neither field when the person record carries neither', () => {
    const outcome = activationOutcome({ data: activation(), status: 200 });

    expect(outcome).toEqual({ kind: 'ready' });
    expect('name' in outcome).toBe(false);
    expect('email' in outcome).toBe(false);
  });

  it('is invalid only on 404 — the one status the platform answers for a token it does not hold', () => {
    expect(activationOutcome({ errors: [], status: 404 })).toEqual({ kind: 'invalid' });
  });

  it.each([0, 500, 502, 503, 504])('is unavailable on %i, so a blip never tells a live invitation it is dead', (status) => {
    expect(activationOutcome({ errors: [{ message: 'boom' }], status })).toEqual({ kind: 'unavailable' });
  });
});
