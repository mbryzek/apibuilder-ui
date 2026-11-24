// dry-copy: sveltekit/screen-report/budget-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import { budgetFor, budgetRecord, fixedRecord, heldFor, requestLine, unlimitedRecord } from './budget';

const GLOBAL = [
  { measure: 'show_ms', value: 500 },
  { measure: 'load_calls', value: 3 },
  { measure: 'load_waits', value: 2 },
  { measure: 'parts', value: 1 },
  { measure: 'poll', value: 1 }
];

const answer = {
  repository: 'mbryzek/idempotent',
  global: GLOBAL,
  budgets: [
    { app: 'idempotent', route: '/issues/[id]', measure: 'show_ms', kind: 'debt', value: 900 },
    { app: 'idempotent', route: '/issues/[id]', measure: 'load_calls', kind: 'exception', value: 5 },
    { app: 'other', route: '/issues/[id]', measure: 'poll', kind: 'debt', value: 9 }
  ]
};

describe('budgetRecord', () => {
  it("reads the global budget and the app's own rows", () => {
    const record = budgetRecord('idempotent', answer);
    expect(record.repository).toBe('mbryzek/idempotent');
    expect(record.global).toEqual({ show_ms: 500, load_calls: 3, load_waits: 2, parts: 1, poll: 1 });
    expect([...record.rows.keys()]).toEqual(['/issues/[id]']);
  });

  it('refuses an answer missing a measure of the global budget, rather than holding a screen to nothing', () => {
    expect(() => budgetRecord('idempotent', { ...answer, global: GLOBAL.slice(1) })).toThrow(/no global budget for show_ms/);
    expect(() => budgetRecord('idempotent', { repository: 'x' })).toThrow(/no global and budgets lists/);
    expect(() => budgetRecord('idempotent', null)).toThrow(/not an object/);
  });
});

describe('budgetFor', () => {
  it('holds a route to its own rows, and every other measure and route to the global budget', () => {
    const record = budgetRecord('idempotent', answer);
    expect(budgetFor('/issues/[id]', record)).toEqual({ showMs: 900, load: { calls: 5, waits: 2 }, parts: 1, poll: 1 });
    expect(budgetFor('/elsewhere', record)).toEqual({ showMs: 500, load: { calls: 3, waits: 2 }, parts: 1, poll: 1 });
    expect(budgetFor(null, record).poll).toBe(1);
  });

  it('says what holds each measure', () => {
    const record = budgetRecord('idempotent', answer);
    expect(heldFor('/issues/[id]', 'load_calls', record)).toEqual({ value: 5, heldBy: 'exception', global: 3 });
    expect(heldFor('/issues/[id]', 'show_ms', record)).toEqual({ value: 900, heldBy: 'debt', global: 500 });
    expect(heldFor('/issues/[id]', 'poll', record)).toEqual({ value: 1, heldBy: 'global', global: 1 });
  });

  it('holds nothing to anything in a measuring run', () => {
    expect(budgetFor('/issues/[id]', unlimitedRecord('idempotent')).load.calls).toBeGreaterThan(1000);
  });
});

describe('fixedRecord', () => {
  it("holds a test's harness route to its own numbers and everything else to the seeded global budget", () => {
    const record = fixedRecord('test', { '/harness': { load_calls: 10, poll: 2 } });
    expect(budgetFor('/harness', record)).toEqual({ showMs: 500, load: { calls: 10, waits: 2 }, parts: 1, poll: 2 });
    expect(heldFor('/elsewhere', 'load_calls', record).heldBy).toBe('global');
  });
});

describe('requestLine', () => {
  it('is the dev budgets request line for the screen and measure, the route quoted for the shell', () => {
    expect(requestLine('hoa-app', '/units/[id]', 'load_calls', 4)).toMatch(
      /^dev budgets request hoa-app '\/units\/\[id\]' --measure load_calls --value 4 --reason ".+" --evidence-file .+$/
    );
  });
});
// dry-copy-end
