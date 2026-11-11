import { describe, expect, it } from 'vitest';
import { expectWithinBudget } from '#lib/telemetry/testing.ts';
import { ctx } from '#lib/telemetry/context.ts';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { answer, anything, emptyAnswer, hardLoadEvent, layoutsOf, noting } from './screenBudget.ts';

type Rows = { length: number; [Symbol.iterator](): Iterator<unknown> };

describe('emptyAnswer', () => {
  it('answers every list, at any depth, with no rows', async () => {
    const body = (await emptyAnswer()('https://apibuilder.org/apicollective/applications').json()) as unknown[] & { versions: Rows };
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
    expect(body.versions.length).toBe(0);
    expect([...body.versions]).toEqual([]);
    expect((body.versions as unknown as { items: Rows }).items.length).toBe(0);
  });

  it('answers the calls the layouts made as the full run does', async () => {
    const shell = new Set<string>();
    await noting(answer, shell)('https://apibuilder.org/organizations?key=apicollective');
    const respond = emptyAnswer(shell);
    expect(await respond('https://apibuilder.org/organizations?key=apicollective').json()).toHaveLength(2);
    expect(await respond('https://apibuilder.org/organizations?key=other').json()).toHaveLength(0);
    expect(await respond('https://apibuilder.org/apicollective/applications').json()).toHaveLength(0);
  });
});

describe('anything', () => {
  it('is a two-row list by default, and so is every list read off it', () => {
    const value = anything() as { versions: Rows };
    expect(value.versions.length).toBe(2);
    expect([...value.versions]).toHaveLength(2);
  });
});

describe('layoutsOf', () => {
  it('drops the page level', () => {
    const page = { server: { load: () => ({}) } };
    const layout = { server: { load: () => ({}) } };
    expect(layoutsOf({ route: '/[orgKey]', levels: [layout, page] }).levels).toEqual([layout]);
  });
});

interface Nested {
  outer: { inner: { id: string }[] };
}

describe('the generic answer', () => {
  it('runs an array method of a nested list over two rows', () => {
    const answer = anything() as Nested;
    const seen = answer.outer.inner.map((row) => row.id);
    expect(Array.isArray(seen) && seen.length === 2).toBe(true);
    expect(answer.outer.inner.filter(() => true)).toHaveLength(2);
    expect([...answer.outer.inner]).toHaveLength(2);
  });

  it('still answers a field named like an array method', () => {
    const answer = anything() as { values: { total: number } };
    expect(Number(answer.values.total)).toBe(1);
  });

  it('counts the calls a load makes for each row of a nested list', async () => {
    // One read, then one call per domain the organization names.
    const load = async (event: never): Promise<unknown> => {
      const client = apiBuilderClient({ headers: getSessionHeaders('budget-session') });
      const organization = await client.getOrganizationByKey(ctx(event, 'load'), 'apicollective');
      return Promise.all(
        organization.domains.map((domain) => client.getApplications(ctx(event, 'load'), { orgKey: domain.name, limit: 10, offset: 0 }))
      );
    };
    const run = await expectWithinBudget(load, hardLoadEvent('/screen-budget-harness') as never, (input) => answer(input), {
      budgets: new Map([['/screen-budget-harness', { load: { calls: 10, waits: 10 } }]])
    });
    expect(run.calls.map((call) => call.operation)).toEqual([
      'GET /apibuilder/organizations/:key',
      'GET /apibuilder/:org_key/applications',
      'GET /apibuilder/:org_key/applications'
    ]);
  });
});
