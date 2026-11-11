// dry-copy: sveltekit/screen-report/testing — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * A route's test holds its first load to budget before merge:
 *
 *     it('stays within its budget', async () => {
 *       await expectWithinBudget(load, event, (input) => answers(input), { budgets });
 *     });
 *
 * where `budgets` is the app's own `budgetTable` of its routes' overrides (`budget.ts`). It runs
 * `load` with a recording context and a fake fetch and throws, naming every call, when the
 * load makes more calls, or more calls that waited on another, than the route's budget allows, when
 * a part that fills in after or a poll tick makes more than its own, or when a fetch went out that
 * no call context noted (a call the type checker cannot see).
 *
 * IT ALSO FAILS A STREAMED PART THE LOAD DID NOT DECLARE, read from what the load returns rather than
 * from the clock: every property of the returned data holding a promise is one SvelteKit streams, so
 * each must be a part opened by `later(...)`. Every `later` call's answer is held back until the load
 * has returned and every other call has been answered, so a promise built on a later part is still
 * waiting then, and a returned promise that has settled by then was made of `load` calls alone, billed
 * to a wait the page never makes. A load returning an array is read as one data object per load, the
 * way a route's hard load hands back every level's data.
 *
 * THE COUNT IS THE SAME ON EVERY RUN. The fake fetch answers each call on its own macrotask, in the
 * order the calls were issued, and `parent` is watched before the load runs, so the waits read are
 * the load's awaits and nothing else.
 */
import { budgetFor, type Budget, type BudgetTable } from './budget';
import { ctx, type ContextEvent } from './context';
import { ViewRecorder, type RecordedCall } from './recorder';
import { halfOf, peaksOfCalls } from './report';
import { mintViewId } from './view';

/** What the fake fetch answers each call with. */
export type Responder = (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>;

export interface BudgetRun {
  budget: Budget;
  calls: RecordedCall[];
  load: { calls: number; waits: number };
  /** The most calls one later part or endpoint made, and one poll tick. */
  peaks: { later: number; poll: number };
  /** Fetches no call context noted. */
  unrecorded: number;
  /** The returned properties the page streams that `later` did not open: their calls are billed to the load. */
  undeclared: string[];
}

/**
 * One macrotask: every promise continuation already queued has run when it resolves. `setImmediate`,
 * never `setTimeout(0)`, which Node holds for at least a millisecond: a run takes one of these per
 * call and per turn it waits, so a timer here is most of a screen budget suite's time.
 */
function macrotask(): Promise<void> {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

/** A fake fetch, and what a budget run asks of it. */
export interface OrderedFetch {
  fetch: typeof fetch;
  /** Every fetch issued, held or not. */
  count: () => number;
  /** Answers every held call, in issue order, and holds nothing from here on. */
  release: () => void;
  /** Whether a call is held. */
  holding: () => boolean;
  /** Whether no call is waiting for its turn to be answered (held calls aside). */
  idle: () => boolean;
}

/**
 * A fetch answering each call on its own macrotask, in issue order, and counting what it was asked. A
 * call issued while `hold()` is true waits, outside that order, until `release()`.
 */
export function orderedFetch(respond: Responder, hold: () => boolean = () => false): OrderedFetch {
  let issued = 0;
  let outstanding = 0;
  let previous: Promise<unknown> = Promise.resolve();
  let held: (() => void)[] | null = [];
  const inTurn = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    outstanding += 1;
    const answer = previous.then(macrotask).then(() => respond(input, init));
    previous = answer
      .catch(() => undefined)
      .then(() => {
        outstanding -= 1;
      });
    return answer;
  };
  const fake = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    issued += 1;
    const queue = held;
    if (queue === null || !hold()) return inTurn(input, init);
    return new Promise<void>((resolve) => queue.push(resolve)).then(() => inTurn(input, init));
  };
  const release = (): void => {
    const queue = held ?? [];
    held = null;
    for (const resolve of queue) resolve();
  };
  return {
    fetch: fake as typeof fetch,
    count: () => issued,
    release,
    holding: () => (held?.length ?? 0) > 0,
    idle: () => outstanding === 0
  };
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === 'object' || typeof value === 'function') && value !== null && typeof (value as { then?: unknown }).then === 'function'
  );
}

/** Every promise the load's data streams, by property name; an array is one data object per load. */
function returnedPromises(data: unknown): [string, PromiseLike<unknown>][] {
  const loads: unknown[] = Array.isArray(data) ? data : [data];
  return loads.flatMap((one) =>
    typeof one === 'object' && one !== null
      ? Object.entries(one).filter((entry): entry is [string, PromiseLike<unknown>] => isThenable(entry[1]))
      : []
  );
}

/**
 * The names of the returned promises settled once every call not held has been answered, other than
 * those `later` opened itself. A promise is read through the engine's own `then`, so a call's promise
 * is not counted as awaited.
 */
async function settledUndeclared(
  returned: [string, PromiseLike<unknown>][],
  opened: WeakSet<object>,
  fake: OrderedFetch
): Promise<string[]> {
  const settled = new Set<string>();
  for (const [name, value] of returned) {
    const mark = (): void => {
      settled.add(name);
    };
    if (value instanceof Promise) void Promise.prototype.then.call(value, mark, mark);
    else value.then(mark, mark);
  }
  do await macrotask();
  while (!fake.idle());
  await macrotask();
  return returned.filter(([name, value]) => settled.has(name) && !opened.has(value)).map(([name]) => name);
}

/**
 * Notes, on `view`, every promise `later` opens and whether a call is being issued for a later part,
 * so the fake fetch can hold that call's answer.
 */
function watchParts(view: ViewRecorder): { opened: WeakSet<object>; issuingLater: () => boolean } {
  const opened = new WeakSet<object>();
  let issuing: string | null = null;
  const pend = view.pend.bind(view);
  view.pend = (promise) => {
    opened.add(promise);
    pend(promise);
  };
  const call = view.call.bind(view);
  view.call = (context, operation, run) => {
    const outer = issuing;
    issuing = context.part;
    try {
      return call(context, operation, run);
    } finally {
      issuing = outer;
    }
  };
  return { opened, issuingLater: () => issuing?.startsWith('later:') ?? false };
}

/**
 * Runs `load`, holding every later part's answer. A load that awaits one of its own later parts would
 * never return, so once nothing else is left to answer the held calls are released, and the returned
 * promises are then not judged by whether they settled.
 */
async function runHolding(load: () => unknown, fake: OrderedFetch): Promise<{ data: unknown; releasedEarly: boolean }> {
  let returned = false;
  let releasedEarly = false;
  void (async (): Promise<void> => {
    while (!returned) {
      await macrotask();
      if (!returned && fake.idle() && fake.holding()) {
        releasedEarly = true;
        fake.release();
      }
    }
  })();
  try {
    const data = await load();
    return { data, releasedEarly };
  } finally {
    returned = true;
  }
}

function describe(calls: RecordedCall[]): string {
  return calls.map((call, i) => `  ${i + 1}. ${call.part} ${call.operation}${call.waited ? ' (waited)' : ''}`).join('\n');
}

function violations(run: BudgetRun): string[] {
  const { budget, load, peaks } = run;
  return [
    load.calls > budget.load.calls ? `${load.calls} calls before showing, budget ${budget.load.calls}` : null,
    load.waits > budget.load.waits ? `${load.waits} calls waited on another, budget ${budget.load.waits}` : null,
    peaks.later > budget.parts ? `${peaks.later} calls in one later part, budget ${budget.parts}` : null,
    peaks.poll > budget.poll ? `${peaks.poll} calls in one poll, budget ${budget.poll}` : null,
    run.unrecorded > 0 ? `${run.unrecorded} fetches no call context noted` : null,
    run.undeclared.length > 0
      ? `returned as a promise the page streams but not opened by later(...), so its calls are billed to the load: ${run.undeclared.join(', ')}`
      : null
  ].filter((line): line is string => line !== null);
}

/** Run `load` against `respond` and throw when it is over its route's budget; the run's counts otherwise. */
export async function expectWithinBudget<E extends ContextEvent>(
  load: (event: E) => unknown,
  event: E,
  respond: Responder,
  options: { budgets?: BudgetTable } = {}
): Promise<BudgetRun> {
  const route = event.route?.id ?? null;
  const view = new ViewRecorder(mintViewId(), route, { side: 'server' });
  const parts = watchParts(view);
  const fake = orderedFetch(respond, parts.issuingLater);
  const recorded: E = { ...event, fetch: fake.fetch, locals: { ...(event.locals ?? {}), screenView: view } };
  // Made before the load runs, so `parent` is watched from its first line.
  ctx(recorded, 'load');
  const original = globalThis.fetch;
  globalThis.fetch = fake.fetch;
  let undeclared: BudgetRun['undeclared'];
  try {
    const { data, releasedEarly } = await runHolding(() => load(recorded), fake);
    undeclared = releasedEarly ? [] : await settledUndeclared(returnedPromises(data), parts.opened, fake);
    fake.release();
    await view.settled();
  } finally {
    globalThis.fetch = original;
  }
  const half = halfOf(view);
  const load_ = half.calls.filter((call) => call.part === 'load');
  const run: BudgetRun = {
    budget: budgetFor(route, options.budgets),
    calls: half.calls,
    load: { calls: load_.length, waits: load_.filter((call) => call.waited).length },
    peaks: peaksOfCalls(half),
    unrecorded: Math.max(0, fake.count() - half.calls.length - half.dropped_calls),
    undeclared
  };
  const over = violations(run);
  if (over.length > 0) {
    throw new Error(`${route ?? 'the load'} is over its budget:\n- ${over.join('\n- ')}\ncalls:\n${describe(run.calls)}`);
  }
  return run;
}
// dry-copy-end
