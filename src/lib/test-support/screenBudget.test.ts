import { describe, expect, it } from 'vitest';
import { fixedRecord } from '#lib/telemetry/budget.ts';
import { expectWithinBudget } from '#lib/telemetry/testing.ts';
import { ctx } from '#lib/telemetry/context.ts';
import { apiBuilderClient, getSessionHeaders } from '#lib/api/clients.ts';
import { error, redirect } from '@sveltejs/kit';
import {
  answer,
  answerWith,
  anything,
  emptyAnswer,
  hardLoad,
  hardLoadEvent,
  layoutsOf,
  noting,
  resetOf,
  routeLoads,
  routeOfPage,
  stubTable,
  unearnedEnd,
  unexpectedEnd
} from './screenBudget.ts';

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
    const run = await expectWithinBudget(load, hardLoadEvent('/screen-budget-harness').event as never, (input) => answer(input), {
      budgets: fixedRecord('test', { '/screen-budget-harness': { load_calls: 10, load_waits: 10 } })
    });
    expect(run.calls.map((call) => call.operation)).toEqual([
      'GET /apibuilder/organizations/:key',
      'GET /apibuilder/:org_key/applications',
      'GET /apibuilder/:org_key/applications'
    ]);
  });
});

/** What `run` throws: a redirect or an error as SvelteKit builds it. */
function thrownBy(run: () => unknown): unknown {
  try {
    run();
  } catch (caught) {
    return caught;
  }
  throw new Error('did not throw');
}

describe('unexpectedEnd', () => {
  const toHome = thrownBy(() => redirect(303, '/'));
  const forbidden = thrownBy(() => error(403, 'Forbidden'));

  it('passes a load that threw nothing', () => {
    expect(unexpectedEnd([])).toEqual([]);
  });

  it('names every throw of a route that declares no redirect, a redirect included', () => {
    expect(unexpectedEnd([forbidden, new TypeError('x is undefined'), toHome])).toEqual([
      'threw error 403: Forbidden',
      expect.stringMatching(/^threw TypeError: x is undefined/),
      'threw redirect 303 to /'
    ]);
  });

  it('passes a declared redirect and names anything else thrown beside it', () => {
    expect(unexpectedEnd([toHome], true)).toEqual([]);
    expect(unexpectedEnd([toHome, forbidden], true)).toEqual(['threw error 403: Forbidden']);
  });

  it('fails a declared redirect the load never reached', () => {
    expect(unexpectedEnd([], true)).toHaveLength(1);
  });

  it('sees what a hard load threw, which it settles rather than rethrows', async () => {
    const thrown: unknown[] = [];
    const notThere = () => {
      throw thrownBy(() => error(404, 'gone'));
    };
    await hardLoad({ route: '/x', levels: [{ server: { load: notThere } }] }, thrown)({});
    expect(unexpectedEnd(thrown)).toEqual(['threw error 404: gone']);
  });
});

describe('unearnedEnd', () => {
  const toLogin = thrownBy(() => redirect(303, '/login'));
  const notFound = thrownBy(() => error(404, 'No such row.'));

  it('passes a lean or empty run that ended in a 404, a redirect, or nothing', () => {
    expect(unearnedEnd([])).toEqual([]);
    expect(unearnedEnd([notFound])).toEqual([]);
    expect(unearnedEnd([toLogin])).toEqual([]);
  });

  it('names a throw only the empty answers reach, and any error other than a 404', async () => {
    const thrown: unknown[] = [];
    const rows: { id: string }[] = [];
    const emptyOnly = () => (rows.length === 0 ? { id: rows[0]!.id } : { id: 'a' });
    await hardLoad({ route: '/x', levels: [{ server: { load: emptyOnly } }] }, thrown)({});
    expect(unearnedEnd([...thrown, notFound, thrownBy(() => error(500, 'boom'))])).toEqual([
      expect.stringMatching(/^threw TypeError: /),
      'threw error 500: boom'
    ]);
  });
});

describe('the stubs a route declares', () => {
  it('keys each budgetStub.ts by its route', () => {
    const table = stubTable({
      '/src/routes/login/budgetStub.ts': { stub: { redirects: true } },
      '/src/routes/tokens/[guid]/budgetStub.ts': { stub: { fields: { id: '1' } } },
      '/src/routes/signup/budgetStub.ts': {}
    });
    expect([...table]).toEqual([
      ['/login', { redirects: true }],
      ['/tokens/[guid]', { fields: { id: '1' } }]
    ]);
  });

  it('answers a stub field with its value at any depth, in the full answer and the empty one', async () => {
    const known = { role: 'admin' };
    const full = (await answerWith(known)('https://apibuilder.org/x').json()) as { role: string; org: { role: string } }[];
    expect(full.map((row) => row.role)).toEqual(['admin', 'admin']);
    expect(full[0]!.org.role).toBe('admin');
    const empty = (await emptyAnswer(new Set(), known)('https://apibuilder.org/x').json()) as unknown[] & { role: string };
    expect(empty).toHaveLength(0);
    expect(empty.role).toBe('admin');
  });
});

describe('a layout reset', () => {
  const layouts = [
    '/src/routes/+layout.svelte',
    '/src/routes/(a)/+layout.svelte',
    '/src/routes/(a)/b/+layout.svelte',
    '/src/routes/(a)/free/+layout@.svelte'
  ];

  /** The load modules of every layout above and of the page itself, each named by its path. */
  async function loadsOf(page: string): Promise<(string | undefined)[]> {
    const named = (path: string) => async () => ({ load: () => path });
    const paths = [
      ...layouts.map((path) => path.replace(/\+layout.*$/, '+layout.server.ts')),
      page.replace(/\+page.*$/, '+page.server.ts')
    ];
    const modules = Object.fromEntries(paths.map((path) => [path, named(path)]));
    const { levels } = await routeLoads(page, modules, layouts);
    return levels.map((level) => (level.server?.load as ((event: never) => string) | undefined)?.(undefined as never));
  }

  it('is a screen at the route of its directory', () => {
    expect(routeOfPage('/src/routes/+page.svelte')).toBe('/');
    expect(routeOfPage('/src/routes/(a)/b/+page.svelte')).toBe('/(a)/b');
    expect(routeOfPage('/src/routes/(a)/b/+page@.svelte')).toBe('/(a)/b');
    expect(routeOfPage('/src/routes/(a)/b/+page@(a).svelte')).toBe('/(a)/b');
  });

  it('names the layout it resets to', () => {
    expect(resetOf('/src/routes/(a)/b/+page.svelte')).toBeUndefined();
    expect(resetOf('/src/routes/(a)/b/+page@.svelte')).toBe('/');
    expect(resetOf('/src/routes/(a)/b/c/+page@(a).svelte')).toBe('/(a)');
    expect(resetOf('/src/routes/(a)/b/+page@b.svelte')).toBe('/(a)/b');
    expect(resetOf('/src/routes/b/b/+layout@b.svelte')).toBe('/b');
    expect(() => resetOf('/src/routes/(a)/b/+page@nowhere.svelte')).toThrow('resets to nowhere');
  });

  it('runs only the loads of the layouts the page keeps, then its own', async () => {
    expect(await loadsOf('/src/routes/(a)/b/+page.svelte')).toEqual([
      '/src/routes/+layout.server.ts',
      '/src/routes/(a)/+layout.server.ts',
      '/src/routes/(a)/b/+layout.server.ts',
      '/src/routes/(a)/b/+page.server.ts'
    ]);
    expect(await loadsOf('/src/routes/(a)/b/+page@(a).svelte')).toEqual([
      '/src/routes/+layout.server.ts',
      '/src/routes/(a)/+layout.server.ts',
      '/src/routes/(a)/b/+page.server.ts'
    ]);
    expect(await loadsOf('/src/routes/(a)/b/+page@.svelte')).toEqual([
      '/src/routes/+layout.server.ts',
      '/src/routes/(a)/b/+page.server.ts'
    ]);
    expect(await loadsOf('/src/routes/(a)/free/x/+page.svelte')).toEqual([
      '/src/routes/+layout.server.ts',
      '/src/routes/(a)/free/+layout.server.ts',
      '/src/routes/(a)/free/x/+page.server.ts'
    ]);
  });
});
