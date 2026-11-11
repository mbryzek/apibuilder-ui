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

  it('fails a returned promise of load calls that settled before the load returned', async () => {
    // The shape that passed a clock-read check: the streamed call is issued first, so it is answered
    // before the slower call the load awaits after it.
    const load = async (e: Event): Promise<{ issue: Promise<unknown>; comments: unknown }> => {
      const issue = getIssue(ctx(e));
      const comments = await getComments(ctx(e));
      return { issue, comments };
    };
    await expect(expectWithinBudget(load, event(), answer)).rejects.toThrow(/not opened by later\(\.\.\.\)[^\n]*: issue/);
  });

  it('passes the same load once later opens the streamed part, chained or not', async () => {
    const load = async (e: Event): Promise<Record<string, unknown>> => {
      const issue = later(ctx(e), 'issue', (c) => getIssue(c));
      const user = later(ctx(e), 'user', (c) => getUser(c)).catch(() => null);
      const comments = await getComments(ctx(e));
      return { issue, user, comments };
    };
    const run = await expectWithinBudget(load, event(), answer);
    expect(run.undeclared).toEqual([]);
    expect(run.calls.map((call) => call.part)).toEqual(['later:issue', 'later:user', 'load']);
  });

  it('fails a returned promise of a load call still in flight when the load returned', async () => {
    const load = async (e: Event): Promise<{ issue: Promise<unknown> }> => {
      await getTenant(ctx(e));
      return { issue: getIssue(ctx(e)) };
    };
    await expect(expectWithinBudget(load, event(), answer)).rejects.toThrow(/not opened by later\(\.\.\.\)[^\n]*: issue$/m);
  });

  it('does not judge a load call the load neither awaited nor returned, as when it threw first', async () => {
    const load = async (e: Event): Promise<Record<string, never>> => {
      void getIssue(ctx(e)).catch(() => undefined);
      return Promise.resolve({});
    };
    const run = await expectWithinBudget(load, event(), answer);
    expect(run.undeclared).toEqual([]);
  });

  it('reads an array as one data object per load, the way a hard load returns its levels', async () => {
    const load = async (e: Event): Promise<unknown[]> => {
      const tenant = getTenant(ctx(e));
      await getIssue(ctx(e));
      return [{ tenant }, { comments: later(ctx(e), 'comments', (c) => getComments(c)) }];
    };
    await expect(expectWithinBudget(load, event(), answer)).rejects.toThrow(/not opened by later\(\.\.\.\)[^\n]*: tenant$/m);
  });

  it('returns from a load that awaits its own later part', async () => {
    const load = async (e: Event): Promise<{ issue: unknown }> => {
      const issue = await later(ctx(e), 'issue', (c) => getIssue(c));
      return { issue };
    };
    const run = await expectWithinBudget(load, event(), answer);
    expect(run.calls.map((call) => call.part)).toEqual(['later:issue']);
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

  it('holds a call issued while hold() is true until release, answering the rest in turn', async () => {
    const order: string[] = [];
    let holding = true;
    const fake = orderedFetch(
      (input) => {
        order.push(String(input));
        return answer();
      },
      () => holding
    );
    const held = fake.fetch('later');
    holding = false;
    await fake.fetch('load');
    expect(order).toEqual(['load']);
    expect(fake.holding()).toBe(true);
    fake.release();
    await held;
    expect(order).toEqual(['load', 'later']);
    expect(fake.count()).toBe(2);
  });
});
// dry-copy-end
