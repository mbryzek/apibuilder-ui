// dry-copy: sveltekit/screen-report/recorder — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The recorder of one screen view: every backend call the view made, which part made it, when it
 * started and ended relative to the view, what it answered, and whether it had to wait on another.
 *
 * THE CONTRACT WITH THE GENERATED CLIENT IS STRUCTURAL. Every generated operation, with the
 * call-context attribute on, takes a `CallContext` first and runs its fetch through
 * `context.recorder.call`:
 *
 *     return context.recorder.call(context, 'getIssue', async (note) => {
 *       const response = await fetch(url, { headers: { ...note.headers(url), ...headers } });
 *       note.response(response);
 *       return parse(response);
 *     });
 *
 * and returns what `call` returns, unwrapped, so the promise the load awaits is the recorder's own.
 * Nothing here imports the generated code and nothing there imports this, so this region builds
 * before the generator lands and the generator tests against any object of this shape.
 *
 * A WAIT IS READ FROM THE LOAD'S AWAITS, NEVER FROM THE CLOCK. `call` returns a promise whose `then`
 * notes the moment the code holding it resumes from awaiting it; a call issued through the same
 * context after that moment waited on it. Every call a page load issues after `await parent()`
 * waits on the layouts' calls. Two loads running in parallel hold two contexts, so their calls never
 * wait on each other however their times fall.
 *
 * THE RECORDER NEVER THROWS AND NEVER BLOCKS A CALL. Its bookkeeping is guarded; a failure in it
 * loses a record, never a response. An error the call itself raises is the caller's, rethrown as is.
 */

/** The view id's header, sent only where it costs no round trip (see `ViewRecorder.headers`). */
export const VIEW_HEADER = 'x-screen-view-id';

/**
 * The call's part's header, sent beside the view id: the API logs it with the call's query count, so
 * monitoring reads a view's load apart from its named polls' ticks, which call lighter endpoints and
 * would otherwise average into it. ISS-85636
 */
export const PART_HEADER = 'x-screen-part';

/** A part the API logs as it stands; any other is not sent, since a header value fetch refuses would cost the call. */
const SENDABLE_PART = /^[A-Za-z0-9._:/[\]()=@+-]{1,128}$/;

/** The headers naming `view` and, where it can travel as a header, `part`. */
function viewHeaders(view: string, part: string): Record<string, string> {
  return SENDABLE_PART.test(part) ? { [VIEW_HEADER]: view, [PART_HEADER]: part } : { [VIEW_HEADER]: view };
}

/** The most calls one report carries; the count beyond it is reported, the calls are not. */
export const MAX_CALLS = 500;

/** What a generated operation is handed to describe its own call. */
export interface CallNote {
  /** The headers this call adds for `url`: the view id and the call's part, where sending them costs no CORS preflight. */
  headers(url: string): Record<string, string>;
  /** The call's answer, for its status and size. */
  response(response: Response): void;
}

/** What a generated operation runs its fetch through. */
export interface CallRecorder {
  call<T>(context: CallContext, operation: string, run: (note: CallNote) => Promise<T>): Promise<T>;
}

/** The first argument of every generated operation: which screen view, which part, and where to note the call. */
export interface CallContext {
  readonly route: string | null;
  readonly view: string;
  readonly part: string;
  readonly recorder: CallRecorder;
}

/** One backend call as a report carries it. Times are milliseconds from the view's start. */
export interface RecordedCall {
  operation: string;
  part: string;
  start_ms: number;
  /** Null while the call is in flight when the report is taken. */
  end_ms: number | null;
  /** Null when no answer arrived: the request itself failed, or is still in flight. */
  status: number | null;
  /** The answer's declared size; null where it declared none. */
  bytes: number | null;
  /** Issued after the code making it awaited an earlier call. */
  waited: boolean;
  /** Whether the backend can count this call's database queries: false where the view id was not sent. */
  queries_counted: boolean;
}

/** Which half of a report a recorder fills. */
export type Side = 'server' | 'browser';

export interface RecorderOptions {
  side: Side;
  /** The clock every time is read on; the view starts at `startedAt` on it. */
  clock?: () => number;
  startedAt?: number;
  /** The page's own origin, in a browser: a call to it may carry the view id. */
  origin?: string | null;
}

/** What the recorder knows about the code holding one context. */
interface Scope {
  /** Calls of this context whose result the holding code has resumed from. */
  resumed: number;
  /** Whether a page load holding this context has awaited `parent()`. */
  afterParent: boolean;
}

/**
 * The promise a call returns. Its `then` is how the recorder learns the holding code resumed from
 * it: `await` reaches a subclass's `then` (only a plain `Promise` takes the engine's fast path), and
 * so does `Promise.all`. Anything chained from it is a plain `Promise` again.
 */
class TrackedCall<T> extends Promise<T> {
  static override get [Symbol.species](): PromiseConstructor {
    return Promise;
  }

  resumed: () => void = () => {};

  override then<A = T, B = never>(
    onFulfilled?: ((value: T) => A | PromiseLike<A>) | null,
    onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null
  ): Promise<A | B> {
    const note = this.resumed;
    return super.then(
      onFulfilled
        ? (value: T): A | PromiseLike<A> => {
            note();
            return onFulfilled(value);
          }
        : onFulfilled,
      onRejected
        ? (reason: unknown): B | PromiseLike<B> => {
            note();
            return onRejected(reason);
          }
        : onRejected
    );
  }
}

function defaultClock(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function declaredBytes(response: Response): number | null {
  const length = response.headers.get('content-length');
  if (length === null) return null;
  const bytes = Number(length);
  return Number.isFinite(bytes) && bytes >= 0 ? bytes : null;
}

export class ViewRecorder implements CallRecorder {
  readonly calls: RecordedCall[] = [];
  /** Calls beyond `MAX_CALLS`, counted and not carried. */
  dropped = 0;
  readonly side: Side;
  readonly startedAt: number;
  private readonly clock: () => number;
  private readonly origin: string | null;
  private readonly scopes = new WeakMap<object, Scope>();
  private readonly polls = new Map<string, number>();
  /** Calls of each poll's current tick, and the most any one tick made: counted whether or not the call is carried. */
  private readonly pollTickCalls = new Map<string, number>();
  private readonly pollPeaks = new Map<string, number>();
  private readonly pending = new Set<Promise<unknown>>();
  /** Every context whose code issued a `load` call: a page load's calls after `await parent()` wait on the others. */
  private readonly loadScopes = new Set<Scope>();

  constructor(
    readonly view: string,
    readonly route: string | null,
    options: RecorderOptions
  ) {
    this.side = options.side;
    this.clock = options.clock ?? defaultClock;
    this.startedAt = options.startedAt ?? this.clock();
    this.origin = options.origin ?? null;
  }

  /** Milliseconds since the view started. */
  elapsed(): number {
    return Math.max(0, Math.round(this.clock() - this.startedAt));
  }

  /**
   * The view id header for a call to `url`: always on the server, and in a browser only to the page's
   * own origin. A custom header on a cross-origin call forces a CORS preflight, so it is not sent
   * there, and the report marks that call's query count missing.
   */
  headers(url: string): Record<string, string> {
    return this.countsQueries(url) ? { [VIEW_HEADER]: this.view } : {};
  }

  private countsQueries(url: string): boolean {
    if (this.side === 'server') return true;
    if (this.origin === null) return false;
    try {
      return new URL(url, this.origin).origin === this.origin;
    } catch {
      return false;
    }
  }

  private scope(context: object): Scope {
    let scope = this.scopes.get(context);
    if (scope === undefined) {
      scope = { resumed: 0, afterParent: false };
      this.scopes.set(context, scope);
    }
    return scope;
  }

  /** A page load holding `context` has awaited `parent()`: what it issues from here waits on the layouts. */
  parentAwaited(context: object): void {
    this.scope(context).afterParent = true;
  }

  private waits(scope: Scope): boolean {
    if (scope.resumed > 0) return true;
    if (!scope.afterParent) return false;
    for (const other of this.loadScopes) if (other !== scope) return true;
    return false;
  }

  private open(context: CallContext, operation: string, scope: Scope): RecordedCall | null {
    this.countPollCall(context.part);
    if (this.calls.length >= MAX_CALLS) {
      this.dropped += 1;
      return null;
    }
    const call: RecordedCall = {
      operation,
      part: context.part,
      start_ms: this.elapsed(),
      end_ms: null,
      status: null,
      bytes: null,
      waited: this.waits(scope),
      queries_counted: this.side === 'server'
    };
    this.calls.push(call);
    if (context.part === 'load') this.loadScopes.add(scope);
    return call;
  }

  call<T>(context: CallContext, operation: string, run: (note: CallNote) => Promise<T>): Promise<T> {
    let record: RecordedCall | null = null;
    let scope: Scope | null = null;
    try {
      scope = this.scope(context);
      record = this.open(context, operation, scope);
    } catch {
      // The recorder never costs a call its answer.
    }
    const note: CallNote = {
      headers: (url) => {
        try {
          const counted = this.countsQueries(url);
          if (record !== null) record.queries_counted = counted;
          return counted ? viewHeaders(this.view, context.part) : {};
        } catch {
          return {};
        }
      },
      response: (response) => {
        try {
          if (record === null) return;
          record.status = response.status;
          record.bytes = declaredBytes(response);
        } catch {
          // As above.
        }
      }
    };
    const settle = (): void => {
      if (record !== null && record.end_ms === null) record.end_ms = this.elapsed();
    };
    // An async wrapper runs `run` now, so the fetch goes out in this tick, and turns a synchronous
    // throw into a rejection carrying the same error.
    const started = (async (): Promise<T> => run(note))();
    const inner = started.then(
      (value) => {
        settle();
        return value;
      },
      (error: unknown) => {
        settle();
        throw error;
      }
    );
    const tracked = new TrackedCall<T>((resolve, reject) => {
      inner.then(resolve, reject);
    });
    const resumedScope = scope;
    let noted = false;
    tracked.resumed = () => {
      if (noted || resumedScope === null) return;
      noted = true;
      resumedScope.resumed += 1;
    };
    return tracked;
  }

  /** One tick of the poll `name`; the report carries each poll's count. Calls of `poll:<name>` from here count toward this tick. */
  pollTick(name: string): void {
    this.polls.set(name, (this.polls.get(name) ?? 0) + 1);
    this.pollTickCalls.set(name, 0);
  }

  pollCounts(): Record<string, number> {
    return Object.fromEntries(this.polls);
  }

  /**
   * The most calls one tick of each poll made. Counted at the call, before the cap, so a view open
   * long enough to pass `MAX_CALLS` still reports its ticks' real size: dividing the calls carried by
   * the ticks counted would read a poll over budget as within it once calls are dropped.
   */
  pollPeakCounts(): Record<string, number> {
    return Object.fromEntries(this.pollPeaks);
  }

  private countPollCall(part: string): void {
    if (!part.startsWith('poll:')) return;
    const name = part.slice('poll:'.length);
    const count = (this.pollTickCalls.get(name) ?? 0) + 1;
    this.pollTickCalls.set(name, count);
    if (count > (this.pollPeaks.get(name) ?? 0)) this.pollPeaks.set(name, count);
  }

  /** A part that fills in after: the view has not settled until it has. */
  pend(promise: Promise<unknown>): void {
    const tracked = promise.then(
      () => undefined,
      () => undefined
    );
    this.pending.add(tracked);
    void tracked.then(() => this.pending.delete(tracked));
  }

  /** Resolves once every part that fills in after has settled, including any opened while waiting. */
  async settled(): Promise<void> {
    while (this.pending.size > 0) {
      await Promise.all([...this.pending]);
    }
  }

  /** Whether any part that fills in after is still in flight. */
  hasPending(): boolean {
    return this.pending.size > 0;
  }
}
// dry-copy-end
