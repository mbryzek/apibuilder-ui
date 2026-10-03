/**
 * Invoking a SvelteKit form action from a unit test, the way SvelteKit would.
 *
 * The event carries only what the caller names: `request`, `locals` and `params` always, and
 * `url` and `cookies` only when given, so an action that starts reading a field its test does not
 * supply fails loudly rather than reading a default nobody chose.
 */

export interface ActionEventOptions<L extends object = object, P extends Record<string, string> = Record<string, string>> {
  /** Appended to the POST body in order. `File` values are sent as file parts. */
  form?: Record<string, string | File>;
  params?: P;
  locals?: L;
  url?: URL;
  cookies?: object;
}

/** A POST event for `form`, as SvelteKit hands it to an action. */
export function actionEvent<L extends object = object, P extends Record<string, string> = Record<string, string>>({
  form = {},
  params = {} as P,
  locals = {} as L,
  url,
  cookies
}: ActionEventOptions<L, P> = {}) {
  const body = new FormData();
  for (const [name, value] of Object.entries(form)) {
    body.append(name, value);
  }
  return {
    request: new Request('http://localhost/', { method: 'POST', body }),
    locals,
    params,
    ...(url ? { url: url } : {}),
    ...(cookies ? { cookies: cookies } : {})
  };
}

/** Calls `action` with the event `actionEvent` builds from `options` and returns its result. */
export function invokeAction<R = unknown>(action: unknown, options: ActionEventOptions = {}): Promise<R> {
  const event = actionEvent(options);
  return (action as (e: typeof event) => Promise<R>)(event);
}
