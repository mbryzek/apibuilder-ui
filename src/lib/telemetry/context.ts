// dry-copy: sveltekit/screen-report/context — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The call context a call site writes: `client.getIssue(ctx(event, 'load'), id)`.
 *
 * `ctx(event, part)` names the screen view and the part making the call. The view comes from one
 * source per kind of view:
 *
 * - a request the server answers: the server hook's view, in `event.locals.screenView`
 *   (`server.ts`), which a universal load running on the server, holding no `locals`, finds through
 *   the hook's request lookup;
 * - a universal load or a call running in the browser: the browser's current view (`browser.ts`).
 *
 * A part is declared at the call, never guessed from timing:
 *
 * - `load`: anything awaited before the load returns, layouts included;
 * - `later:<name>`: a promise the load returns unawaited, opened by `later(ctx, '<name>', fn)`;
 * - `poll:<name>`: one tick of a page refreshing on a timer, opened by `poll(...)`;
 * - `endpoint:<route>`: an app endpoint (`+server.ts`) answering the page's own script, written
 *   `ctx(event, 'endpoint')`;
 * - `form`: a form action; `browser`: a call a component makes in the browser (`viewCtx('browser')`).
 *
 * A helper under `src/lib` that calls the backend takes a context from its caller rather than
 * making one: that is how the type checker finds every call site.
 */
import { ViewRecorder, type CallContext } from './recorder';

export type { CallContext } from './recorder';

/** The parts a call site names; `later`, `poll` and `endpoint` are qualified by name or route. */
export type Part = 'load' | 'form' | 'browser' | 'endpoint' | `later:${string}` | `poll:${string}` | `endpoint:${string}`;

/** The fields of a load or request event `ctx` reads, declared by shape. */
export interface ContextEvent {
  route?: { id: string | null };
  locals?: object;
  parent?: () => Promise<unknown>;
}

/** Where `ctx` finds the view when the event carries none: the server's request, or the browser's current view. */
let lookupView: () => ViewRecorder | undefined = () => undefined;

/** Installed once by the server hook module and by the browser half. */
export function setViewLookup(lookup: () => ViewRecorder | undefined): void {
  lookupView = lookup;
}

/** The view a request event carries, if the server hook opened one. */
export function viewOfLocals(locals: object | undefined): ViewRecorder | undefined {
  const view = (locals as { screenView?: unknown } | undefined)?.screenView;
  return view instanceof ViewRecorder ? view : undefined;
}

/** A context that records into nothing reported: what a call made outside any view gets, rather than an error. */
function detached(route: string | null, part: string): CallContext {
  return { route, view: 'detached', part, recorder: new ViewRecorder('detached', route, { side: 'server' }) };
}

/** One context per event and part, so the waits of one load are read across all of its call sites. */
const contexts = new WeakMap<object, Map<string, CallContext>>();

function resolvePart(part: Part, route: string | null): string {
  return part === 'endpoint' ? `endpoint:${route ?? ''}` : part;
}

/**
 * Note `await parent()` in a page load. The event's `parent` is wrapped the first time a context is
 * made for it, so a load that makes its context before awaiting `parent()` has every call after it
 * read as waiting on the layouts. One that awaits `parent()` before its first call site is read
 * without that wait in production; its route test reads it, because `expectWithinBudget` wraps
 * `parent` before the load runs.
 */
export function watchParent(event: ContextEvent, view: ViewRecorder, context: CallContext): void {
  const original = event.parent;
  if (typeof original !== 'function') return;
  try {
    event.parent = () =>
      original.call(event).then((data) => {
        view.parentAwaited(context);
        return data;
      });
  } catch {
    // An event that refuses the wrapper is read without the parent wait.
  }
}

/** The context for a call `event`'s load, action or endpoint makes as `part`. Never throws. */
export function ctx(event: ContextEvent, part: Part = 'load'): CallContext {
  const route = event.route?.id ?? null;
  const resolved = resolvePart(part, route);
  try {
    let byPart = contexts.get(event);
    if (byPart === undefined) {
      byPart = new Map();
      contexts.set(event, byPart);
    }
    const existing = byPart.get(resolved);
    if (existing !== undefined) return existing;
    const view = viewOfLocals(event.locals) ?? lookupView();
    if (view === undefined) return detached(route, resolved);
    const context: CallContext = { route, view: view.view, part: resolved, recorder: view };
    byPart.set(resolved, context);
    if (resolved === 'load') watchParent(event, view, context);
    return context;
  } catch {
    return detached(route, resolved);
  }
}

/** A context for a component's own call, in the browser's current view. */
export function viewCtx(part: Part = 'browser'): CallContext {
  const view = lookupView();
  if (view === undefined) return detached(null, part);
  return { route: view.route, view: view.view, part, recorder: view };
}

/**
 * A part that fills in after: the load returns this promise unawaited, and its calls are part
 * `later:<name>`, budgeted per part. The view is not settled, and its report not sent, until it has.
 */
export function later<T>(context: CallContext, name: string, fn: (context: CallContext) => Promise<T>): Promise<T> {
  const part: CallContext = { ...context, part: `later:${name}` };
  const promise = fn(part);
  if (context.recorder instanceof ViewRecorder) context.recorder.pend(promise);
  return promise;
}

/**
 * One tick of the poll `name`: its calls are part `poll:<name>`, budgeted per tick, and the report
 * counts the ticks, so a page left open all afternoon is not over budget for being open.
 */
export function poll<T>(context: CallContext, name: string, fn: (context: CallContext) => Promise<T>): Promise<T> {
  const part: CallContext = { ...context, part: `poll:${name}` };
  if (context.recorder instanceof ViewRecorder) context.recorder.pollTick(name);
  return fn(part);
}
// dry-copy-end
