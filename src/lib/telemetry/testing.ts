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
}

/** A fetch answering each call on its own macrotask, in issue order, and counting what it was asked. */
export function orderedFetch(respond: Responder): { fetch: typeof fetch; count: () => number } {
  let issued = 0;
  let previous: Promise<unknown> = Promise.resolve();
  const fake = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    issued += 1;
    const answer = previous.then(() => new Promise<void>((resolve) => setTimeout(resolve, 0))).then(() => respond(input, init));
    previous = answer.catch(() => undefined);
    return answer;
  };
  return { fetch: fake as typeof fetch, count: () => issued };
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
    run.unrecorded > 0 ? `${run.unrecorded} fetches no call context noted` : null
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
  const fake = orderedFetch(respond);
  const recorded: E = { ...event, fetch: fake.fetch, locals: { ...(event.locals ?? {}), screenView: view } };
  // Made before the load runs, so `parent` is watched from its first line.
  ctx(recorded, 'load');
  const original = globalThis.fetch;
  globalThis.fetch = fake.fetch;
  try {
    await load(recorded);
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
    unrecorded: Math.max(0, fake.count() - half.calls.length - half.dropped_calls)
  };
  const over = violations(run);
  if (over.length > 0) {
    throw new Error(`${route ?? 'the load'} is over its budget:\n- ${over.join('\n- ')}\ncalls:\n${describe(run.calls)}`);
  }
  return run;
}
// dry-copy-end
