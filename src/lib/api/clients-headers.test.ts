import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimitBypassHeaders } from '$generated/generated-util';
import type * as ConfigModule from '$lib/config';

// config.isProduction is read per call, so flipping it here exercises both sides of the
// generated helper the wrappers in clients.ts bind it to.
const env = vi.hoisted(() => ({ isProduction: false }));

vi.mock('$lib/config', async (importOriginal) => {
  const actual = await importOriginal<typeof ConfigModule>();
  return {
    ...actual,
    config: {
      ...actual.config,
      get isProduction() {
        return env.isProduction;
      }
    }
  };
});

const { getSessionHeaders } = await import('./clients');

const BYPASS = rateLimitBypassHeaders({ isProduction: false });

beforeEach(() => {
  env.isProduction = false;
});

describe('getSessionHeaders', () => {
  it('sends the bypass headers off production', () => {
    expect(Object.keys(BYPASS).length).toBeGreaterThan(0);
    expect(getSessionHeaders()).toEqual(BYPASS);
    expect(getSessionHeaders('sess-1')).toEqual({ ...BYPASS, session_id: 'sess-1' });
  });

  it('sends only the session in production', () => {
    env.isProduction = true;
    expect(getSessionHeaders()).toEqual({});
    expect(getSessionHeaders('sess-1')).toEqual({ session_id: 'sess-1' });
  });
});
