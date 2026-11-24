// dry-copy: sveltekit/screen-report/testing-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it, vi } from 'vitest';
import { budgetRecord } from './budget';
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

const GLOBAL = [
  { measure: 'show_ms', value: 500 },
  { measure: 'load_calls', value: 3 },
  { measure: 'load_waits', value: 2 },
  { measure: 'parts', value: 1 },
  { measure: 'poll', value: 1 }
];

/** The record with `rows` for app `idempotent`: each a route, a measure, its kind and its value. */
function recordWith(...rows: { route: string; measure: string; kind: string; value: number }[]) {
  return budgetRecord('idempotent', {
    repository: 'mbryzek/idempotent',
    global: GLOBAL,
    budgets: rows.map((row) => ({ app: 'idempotent', ...row }))
  });
}

const record = recordWith();

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
      answer,
      { budgets: record }
    );
    expect(run.load).toEqual({ calls: 3, waits: 0 });
  });

  it('counts a call issued after the load awaited another as waiting, the same on every run', async () => {
    const load = async (e: Event): Promise<void> => {
      await getTenant(ctx(e));
      await Promise.all([getIssue(ctx(e)), getComments(ctx(e))]);
    };
    for (let i = 0; i < 5; i += 1) {
      const run = await expectWithinBudget(load, event(), answer, { budgets: record });
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
      answer,
      { budgets: record }
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
    await expect(expectWithinBudget(load, event(), answer, { budgets: record })).rejects.toThrow(
      /4 calls before showing, budget 3[\s\S]*getUser/
    );
  });

  it('holds a route to its own row in the record', async () => {
    const load = async (e: Event): Promise<void> => {
      await Promise.all([getTenant(ctx(e)), getIssue(ctx(e)), getComments(ctx(e)), getUser(ctx(e))]);
    };
    const budgets = recordWith({ route: '/issues/[id]', measure: 'load_calls', kind: 'debt', value: 4 });
    const run = await expectWithinBudget(load, event(), answer, { budgets });
    expect(run.budget.load.calls).toBe(4);
  });

  it('names the measure, the budget, what holds it, the count and the request line of a load over its budget', async () => {
    const load = async (e: Event): Promise<void> => {
      await Promise.all([getTenant(ctx(e)), getIssue(ctx(e)), getComments(ctx(e)), getUser(ctx(e)), getUser(ctx(e))]);
    };
    const budgets = recordWith({ route: '/issues/[id]', measure: 'load_calls', kind: 'debt', value: 4 });
    const failure = await expectWithinBudget(load, event(), answer, { budgets }).catch((error: unknown) => String(error));
    expect(failure).toContain('/issues/[id] is over its budget');
    expect(failure).toContain('load_calls: 5 calls before showing, budget 4, held by its debt row (global 3), which only goes down');
    expect(failure).toContain("dev budgets request idempotent '/issues/[id]' --measure load_calls --value 5");
  });

  it('notes what every run counted, over its budget or not', async () => {
    const noted: { route: string | null; calls: number }[] = [];
    const counts = { note: (route: string | null, run: { load: { calls: number } }) => noted.push({ route, calls: run.load.calls }) };
    const four = async (e: Event): Promise<void> => {
      await Promise.all([getTenant(ctx(e)), getIssue(ctx(e)), getComments(ctx(e)), getUser(ctx(e))]);
    };
    await expect(expectWithinBudget(four, event(), answer, { budgets: record, counts: counts as never })).rejects.toThrow(
      /held by the global budget/
    );
    expect(noted).toEqual([{ route: '/issues/[id]', calls: 4 }]);
  });

  it('holds a part that fills in after to its own budget, and waits for it', async () => {
    const load = async (e: Event): Promise<{ comments: Promise<unknown> }> => {
      await getIssue(ctx(e));
      return { comments: later(ctx(e), 'comments', async (c) => Promise.all([getComments(c), getUser(c)])) };
    };
    await expect(expectWithinBudget(load, event(), answer, { budgets: record })).rejects.toThrow(/2 calls in one later part, budget 1/);
  });

  it('reads a poll per tick', async () => {
    const run = await expectWithinBudget(
      async (e: Event) => {
        for (let tick = 0; tick < 3; tick += 1) await poll(ctx(e), 'status', (c) => getIssue(c));
      },
      event(),
      answer,
      { budgets: record }
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
    await expect(expectWithinBudget(load, event(), answer, { budgets: record })).rejects.toThrow(
      /not opened by later\(\.\.\.\)[^\n]*: issue/
    );
  });

  it('passes the same load once later opens the streamed part, chained or not', async () => {
    const load = async (e: Event): Promise<Record<string, unknown>> => {
      const issue = later(ctx(e), 'issue', (c) => getIssue(c));
      const user = later(ctx(e), 'user', (c) => getUser(c)).catch(() => null);
      const comments = await getComments(ctx(e));
      return { issue, user, comments };
    };
    const run = await expectWithinBudget(load, event(), answer, { budgets: record });
    expect(run.undeclared).toEqual([]);
    expect(run.calls.map((call) => call.part)).toEqual(['later:issue', 'later:user', 'load']);
  });

  it('fails a returned promise of a load call still in flight when the load returned', async () => {
    const load = async (e: Event): Promise<{ issue: Promise<unknown> }> => {
      await getTenant(ctx(e));
      return { issue: getIssue(ctx(e)) };
    };
    await expect(expectWithinBudget(load, event(), answer, { budgets: record })).rejects.toThrow(
      /not opened by later\(\.\.\.\)[^\n]*: issue$/m
    );
  });

  it('does not judge a load call the load neither awaited nor returned, as when it threw first', async () => {
    const load = async (e: Event): Promise<Record<string, never>> => {
      void getIssue(ctx(e)).catch(() => undefined);
      return Promise.resolve({});
    };
    const run = await expectWithinBudget(load, event(), answer, { budgets: record });
    expect(run.undeclared).toEqual([]);
  });

  it('reads an array as one data object per load, the way a hard load returns its levels', async () => {
    const load = async (e: Event): Promise<unknown[]> => {
      const tenant = getTenant(ctx(e));
      await getIssue(ctx(e));
      return [{ tenant }, { comments: later(ctx(e), 'comments', (c) => getComments(c)) }];
    };
    await expect(expectWithinBudget(load, event(), answer, { budgets: record })).rejects.toThrow(
      /not opened by later\(\.\.\.\)[^\n]*: tenant$/m
    );
  });

  it('returns from a load that awaits its own later part', async () => {
    const load = async (e: Event): Promise<{ issue: unknown }> => {
      const issue = await later(ctx(e), 'issue', (c) => getIssue(c));
      return { issue };
    };
    const run = await expectWithinBudget(load, event(), answer, { budgets: record });
    expect(run.calls.map((call) => call.part)).toEqual(['later:issue']);
  });

  it('fails a fetch no call context noted', async () => {
    const load = async (): Promise<void> => {
      await fetch('https://api.test/untyped');
    };
    await expect(expectWithinBudget(load, event(), answer, { budgets: record })).rejects.toThrow(/1 fetches no call context noted/);
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

  it("answers without a timer, so no call waits out setTimeout's millisecond", async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    try {
      const fake = orderedFetch(() => answer());
      await Promise.all([fake.fetch('a'), fake.fetch('b')]);
      expect(fake.idle()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
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
