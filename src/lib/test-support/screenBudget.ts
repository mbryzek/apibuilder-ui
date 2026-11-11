/**
 * What a route's budget test runs (DES-65431): a screen's hard load as SvelteKit runs it, every
 * layout's load and the page's own, against a backend that answers every call.
 *
 * THE LOADS RUN THE WAY A HARD LOAD RUNS THEM. Every server load (`+layout.server.ts` down the
 * route's directories, then `+page.server.ts`) starts at once, each one's `parent()` the merged data
 * of the server loads above it; once they have settled, every universal load (`+layout.ts`,
 * `+page.ts`) starts at once the same way, handed its own level's server data. That is what the
 * report's server half counts for a hard load, layouts included.
 *
 * THE BACKEND ANSWERS EVERYTHING. A call's answer is two rows, each of which answers any field with
 * another such value, so a load reaches every call it would make on a page with data. A load that
 * throws (a redirect, a value the stub cannot stand in for) is counted up to where it threw: the
 * budget is about the calls it made, and the route's own tests are about what it does.
 *
 * EVERY REQUEST IS SIGNED IN. Most of this app's screens send a signed-out visitor to sign in before
 * they read anything, so the event carries the session the request hook would have found, and each
 * screen makes every call it makes for a member. The hook's own session check is the shell's read,
 * never a screen's, so it is not part of the run.
 *
 * AND THEN IT ANSWERS NOTHING. Each route runs a second time against {@link emptyAnswer}, where every
 * list the screen's own loads read, at every depth, has no rows, so a call made only when a list is
 * empty (a lookup an empty state makes) is counted too, against the same budget. The calls the
 * route's layouts make keep their full answer: they are who is signed in and which organization they
 * are in, noted by running the layouts alone first ({@link layoutsOf}, {@link noting}). That run may
 * stop early at a 404 or a redirect: it only adds a branch to the full run, never replaces it.
 * ISS-78653
 */

/** How many rows every list of an answer has: two for the full run, none for the empty one. */
export type RowCount = 0 | 2;

/**
 * A value answering any field, call, iteration or coercion with another of its kind. As a list it
 * has `count` rows, and so does every list read off it.
 */
export function anything(count: RowCount = 2): unknown {
  const fields = new Map<PropertyKey, unknown>();
  const rows = (): unknown[] => Array.from({ length: count }, () => anything(count));
  const target = () => undefined;
  return new Proxy(target, {
    apply: () => anything(count),
    construct: () => anything(count) as object,
    get: (_, key) => {
      if (key === 'then' || key === 'toJSON') return undefined;
      if (key === 'length') return count;
      if (key === Symbol.iterator) return () => rows()[Symbol.iterator]();
      if (key === Symbol.asyncIterator) return undefined;
      if (key === Symbol.toPrimitive)
        return (hint: string) => (hint === 'number' ? 1 : hint === 'string' ? 'value' : '2026-01-01T00:00:00.000Z');
      if (key === 'toString') return () => 'value';
      if (key === 'valueOf') return () => 1;
      if (!fields.has(key)) fields.set(key, anything(count));
      return fields.get(key);
    }
  });
}

/**
 * The body every call is answered with: a real array of `count` rows (a list read checks for one),
 * each row {@link anything}. Any other field is read off a row of the same kind, so an answer that is
 * an object rather than a list still answers, its own lists `count` rows long.
 */
export function answerBody(count: RowCount = 2): unknown {
  const rows = Array.from({ length: count }, () => anything(count));
  const single = anything(count) as Record<PropertyKey, unknown>;
  return new Proxy(rows, {
    get: (target, key, receiver) => {
      if (key === 'then' || key === 'toJSON') return undefined;
      if (key in target) return Reflect.get(target, key, receiver) as unknown;
      return ((target[0] ?? single) as Record<PropertyKey, unknown>)[key];
    }
  });
}

/** A `Response` whose `json()` is `body`. */
function respondWith(body: () => unknown): Response {
  const response = new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
  Object.defineProperty(response, 'json', { value: async () => body() });
  return response;
}

/** What the backend answers every call with: {@link answerBody}. */
export function answer(_input: RequestInfo | URL): Response {
  return respondWith(() => answerBody());
}

/** What the backend answers a call with. */
export type Respond = (input: RequestInfo | URL, init?: RequestInit) => Response;

/** A call's address, without its origin: the path and the query. */
function addressOf(input: RequestInfo | URL): string {
  const url = new URL(input instanceof Request ? input.url : String(input), 'https://apibuilder.org');
  return `${url.pathname}${url.search}`;
}

/** `respond`, adding the address of every call it answers to `seen`. */
export function noting(respond: Respond, seen: Set<string>): Respond {
  return (input, init) => {
    seen.add(addressOf(input));
    return respond(input, init);
  };
}

/**
 * What the backend answers in the empty run: a call the route's layouts make (`shell`, as
 * {@link noting} saw them) as {@link answer} does, every other call with no rows in any list, at any depth.
 */
export function emptyAnswer(shell: ReadonlySet<string> = new Set()): Respond {
  return (input) => (shell.has(addressOf(input)) ? answer(input) : respondWith(() => answerBody(0)));
}

/** One route's load modules, from the root down: each level's layouts, then the page's. */
export interface RouteLoads {
  route: string;
  levels: { server?: LoadModule | undefined; universal?: LoadModule | undefined }[];
}

export interface LoadModule {
  load?: (event: never) => unknown;
}

type Importer = () => Promise<unknown>;

/** The route id a `src/routes/.../+page.svelte` path is the screen of. */
export function routeOfPage(path: string): string {
  const dir = path.replace(/^\/src\/routes/, '').replace(/\/\+page\.svelte$/, '');
  return dir === '' ? '/' : dir;
}

/** Every directory from the routes root down to `route`'s, as `/src/routes...` prefixes. */
function levelsOf(route: string): string[] {
  const parts = route === '/' ? [] : route.split('/').slice(1);
  return ['/src/routes', ...parts.map((_, i) => `/src/routes/${parts.slice(0, i + 1).join('/')}`)];
}

/** The load modules of `route`, read through the app's globs. */
export async function routeLoads(route: string, modules: Record<string, Importer>): Promise<RouteLoads> {
  const levels = levelsOf(route);
  const read = async (path: string): Promise<LoadModule | undefined> =>
    modules[path] ? ((await modules[path]()) as LoadModule) : undefined;
  const out: RouteLoads['levels'] = [];
  for (const [i, dir] of levels.entries()) {
    const leaf = i === levels.length - 1;
    const layout = { server: await read(`${dir}/+layout.server.ts`), universal: await read(`${dir}/+layout.ts`) };
    if (layout.server?.load || layout.universal?.load) out.push(layout);
    if (leaf) out.push({ server: await read(`${dir}/+page.server.ts`), universal: await read(`${dir}/+page.ts`) });
  }
  return { route, levels: out };
}

/** The route's layouts alone, every level above its page: what the empty run's backend answers in full. */
export function layoutsOf(loads: RouteLoads): RouteLoads {
  return { route: loads.route, levels: loads.levels.slice(0, -1) };
}

/** The params a route's URL fills: `1` for each `[name]`, `[name=matcher]` and `[...rest]`. */
export function paramsOf(route: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const match of route.matchAll(/\[(?:\.\.\.)?([a-zA-Z_]+)(?:=[a-zA-Z_]+)?\]/g)) params[match[1]!] = '1';
  return params;
}

/** The address a route answers at with {@link paramsOf}: groups dropped, each param `1`. */
export function pathOf(route: string): string {
  const path = route
    .split('/')
    .filter((segment) => !/^\(.*\)$/.test(segment))
    .map((segment) => (/^\[.*\]$/.test(segment) ? '1' : segment.replace(/\[[^\]]*\]/g, '1')))
    .join('/');
  return path === '' ? '/' : path;
}

/** The session the request hook would have found for a signed-in member. */
export const SESSION = { id: 'budget-session', user: { id: 'budget-user', email: 'budget@example.com', nickname: 'budget' } };

/** The cookies of the request; a load that sets or clears one (the flash) finds a jar. */
function cookieJar(): Record<string, unknown> {
  const jar = new Map<string, string>();
  return {
    get: (name: string) => jar.get(name),
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string) => void jar.set(name, String(value)),
    delete: (name: string) => void jar.delete(name),
    serialize: () => ''
  };
}

/** The event a hard load of `route` hands each load, with the fields SvelteKit gives it. */
export function hardLoadEvent(route: string): Record<string, unknown> {
  const url = new URL(`https://apibuilder.org${pathOf(route)}`);
  return {
    url,
    params: paramsOf(route),
    route: { id: route },
    locals: { session: SESSION },
    request: new Request(url),
    cookies: cookieJar(),
    isDataRequest: false,
    isSubRequest: false,
    platform: undefined,
    depends: () => undefined,
    untrack: <T>(fn: () => T) => fn(),
    setHeaders: () => undefined,
    getClientAddress: () => '127.0.0.1',
    tracing: { enabled: false, root: undefined, current: undefined }
  };
}

async function settle(run: () => unknown, thrown: unknown[]): Promise<Record<string, unknown>> {
  try {
    const data = await run();
    return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
  } catch (caught) {
    thrown.push(caught);
    return {};
  }
}

/**
 * The hard load of a route, as one load `expectWithinBudget` runs: `event` is the recorded event it
 * hands over, whose `fetch` and `locals` every level's own event shares. What each load threw is
 * pushed onto `thrown`. It returns every level's data, the server loads' and then the universal
 * loads' (a level with no universal load counted once), so `expectWithinBudget` reads what the page
 * streams from it.
 */
export function hardLoad(
  loads: RouteLoads,
  thrown: unknown[] = []
): (event: Record<string, unknown>) => Promise<Record<string, unknown>[]> {
  return async (event) => {
    const serverData: Promise<Record<string, unknown>>[] = [];
    loads.levels.forEach((level, i) => {
      const above = serverData.slice(0, i);
      const parent = async () => Object.assign({}, ...(await Promise.all(above)));
      const load = level.server?.load;
      serverData.push(load ? settle(() => load({ ...event, parent } as never), thrown) : Promise.resolve({}));
    });
    const server = await Promise.all(serverData);
    const universalData: Promise<Record<string, unknown>>[] = [];
    loads.levels.forEach((level, i) => {
      const above = universalData.slice(0, i);
      const parent = async () => Object.assign({}, ...(await Promise.all(above)));
      const load = level.universal?.load;
      universalData.push(
        load ? settle(() => load({ ...event, parent, data: server[i] } as never), thrown) : Promise.resolve(server[i] ?? {})
      );
    });
    const universal = await Promise.all(universalData);
    return [...server, ...universal.filter((_, i) => loads.levels[i]?.universal?.load)];
  };
}
