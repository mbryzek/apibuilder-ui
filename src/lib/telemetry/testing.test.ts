// dry-copy: sveltekit/screen-report/testing-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import { budgetTable } from './budget';
import { ctx, later, poll, type CallContext } from './context';
import { expectWithinBudget, orderedFetch } from './testing';

/** A generated operation, as the call-context attribute shapes one. */
function operation(name: string): (context: CallContext) => Promise<unknown> {
  return (context) =>
    context.recorder.call(context, name, async (note) => {
      const url = `https://api.test/${name}`;
      const response = await fetch(url, { headers: note.headers(url) });
      note.response(response);
      return response.json();
    });
}

const getTenant = operation('getTenant');
const getIssue = operation('getIssue');
const getComments = operation('getComments');
const getUser = operation('getUser');

const answer = (): Response => Response.json({ ok: true });

interface Event {
  route: { id: string };
  parent: () => Promise<unknown>;
  locals?: object;
}

function event(route = '/issues/[id]'): Event {
  return { route: { id: route }, parent: () => Promise.resolve({}) };
}

describe('expectWithinBudget', () => {
  it('passes a load that makes its calls in parallel', async () => {
    const run = await expectWithinBudget(
      async (e: Event) => Promise.all([getTenant(ctx(e)), getIssue(ctx(e)), getComments(ctx(e))]),
      event(),
      answer
    );
    expect(run.load).toEqual({ calls: 3, waits: 0 });
  });

  it('counts a call issued after the load awaited another as waiting, the same on every run', async () => {
    const load = async (e: Event): Promise<void> => {
      await getTenant(ctx(e));
      await Promise.all([getIssue(ctx(e)), getComments(ctx(e))]);
    };
    for (let i = 0; i < 5; i += 1) {
      const run = await expectWithinBudget(load, event(), answer);
      expect(run.calls.map((call) => [call.operation, call.waited])).toEqual([
        ['getTenant', false],
        ['getIssue', true],
        ['getComments', true]
      ]);
    }
  });

  it('counts every call after await parent() as waiting on the layouts', async () => {
    const layoutCall = async (): Promise<void> => {
      // The layout's call, in a context of its own, as SvelteKit runs a layout load beside the page's.
      const layout = { route: { id: '/issues/[id]' } };
      await getUser(ctx({ ...layout, locals: e.locals ?? {} }));
    };
    const e = event();
    const run = await expectWithinBudget(
      async (page: Event) => {
        e.locals = page.locals ?? {};
        await layoutCall();
        await page.parent();
        await getIssue(ctx(page));
      },
      e,
      answer
    );
    expect(run.calls.map((call) => [call.operation, call.waited])).toEqual([
      ['getUser', false],
      ['getIssue', true]
    ]);
  });

  it('fails a load over its budget, naming every call', async () => {
    const load = async (e: Event): Promise<void> => {
      await Promise.all([getTenant(ctx(e)), getIssue(ctx(e)), getComments(ctx(e)), getUser(ctx(e))]);
    };
    await expect(expectWithinBudget(load, event(), answer)).rejects.toThrow(/4 calls before showing, budget 3[\s\S]*getUser/);
  });

  it('holds a route to its own override', async () => {
    const load = async (e: Event): Promise<void> => {
      await Promise.all([getTenant(ctx(e)), getIssue(ctx(e)), getComments(ctx(e)), getUser(ctx(e))]);
    };
    const budgets = budgetTable({ '/src/routes/issues/[id]/budget.ts': { budget: { load: { calls: 4 } } } });
    const run = await expectWithinBudget(load, event(), answer, { budgets });
    expect(run.budget.load.calls).toBe(4);
  });

  it('holds a part that fills in after to its own budget, and waits for it', async () => {
    const load = async (e: Event): Promise<{ comments: Promise<unknown> }> => {
      await getIssue(ctx(e));
      return { comments: later(ctx(e), 'comments', async (c) => Promise.all([getComments(c), getUser(c)])) };
    };
    await expect(expectWithinBudget(load, event(), answer)).rejects.toThrow(/2 calls in one later part, budget 1/);
  });

  it('reads a poll per tick', async () => {
    const run = await expectWithinBudget(
      async (e: Event) => {
        for (let tick = 0; tick < 3; tick += 1) await poll(ctx(e), 'status', (c) => getIssue(c));
      },
      event(),
      answer
    );
    expect(run.peaks.poll).toBe(1);
  });

  it('fails a fetch no call context noted', async () => {
    const load = async (): Promise<void> => {
      await fetch('https://api.test/untyped');
    };
    await expect(expectWithinBudget(load, event(), answer)).rejects.toThrow(/1 fetches no call context noted/);
  });
});

describe('orderedFetch', () => {
  it('answers in issue order, one macrotask each', async () => {
    const order: string[] = [];
    const fake = orderedFetch((input) => {
      order.push(String(input));
      return answer();
    });
    await Promise.all([fake.fetch('a'), fake.fetch('b'), fake.fetch('c')]);
    expect(order).toEqual(['a', 'b', 'c']);
    expect(fake.count()).toBe(3);
  });
});
// dry-copy-end
