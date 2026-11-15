/**
 * Which query parameters a screen's hard load reads, against the ones its hard load carried. A load
 * reading a parameter the hard load did not set is measured on the branch that parameter's absence
 * takes, which is not the screen people open: `/admin/chat` was held to a new conversation's calls
 * while people open `?chat=1` (ISS-79901). The budget test fails such a route until its override
 * names the parameter. ISS-80720
 */
// dry-copy: sveltekit/screen-budget/query-params — every copy of this region must match; `dev repo copies` checks it (ISS-80720)

/** A URL for a hard load whose `searchParams` record each parameter name a load reads, and the names read. */
export interface ReadingUrl {
  url: URL;
  read: ReadonlySet<string>;
}

/** The `URLSearchParams` methods that read one parameter, named by their first argument. */
const READS_ONE: ReadonlySet<PropertyKey> = new Set(['get', 'getAll', 'has']);

/** The `URLSearchParams` members that read every parameter the URL carries. */
const READS_EVERY: ReadonlySet<PropertyKey> = new Set(['entries', 'keys', 'values', 'forEach', 'toString', 'size', Symbol.iterator]);

/** `params`, noting into `read` every name read through it. */
function readingParams(params: URLSearchParams, read: Set<string>): URLSearchParams {
  const readEvery = () => {
    for (const name of params.keys()) read.add(name);
  };
  return new Proxy(params, {
    get(target, prop) {
      if (READS_EVERY.has(prop)) readEvery();
      const value: unknown = Reflect.get(target, prop, target);
      if (typeof value !== 'function') return value;
      if (READS_ONE.has(prop))
        return (name: string, ...rest: unknown[]) => {
          read.add(String(name));
          return (value as (...args: unknown[]) => unknown).call(target, name, ...rest);
        };
      return (value as (...args: unknown[]) => unknown).bind(target);
    }
  });
}

/**
 * `url` as a hard load's `url`, whose `searchParams` note every name a load reads: by `get`, `getAll`
 * and `has` the name it asks for, and by `entries`, `keys`, `values`, `forEach`, `toString`, `size`
 * and iteration every name the URL carries. `read` fills as the loads run.
 */
export function readingUrl(url: URL): ReadingUrl {
  const read = new Set<string>();
  const reading = new URL(url.href);
  const params = readingParams(reading.searchParams, read);
  Object.defineProperty(reading, 'searchParams', { get: () => params });
  return { url: reading, read };
}

/**
 * Each parameter in `read` that `url` does not carry and `bare` does not list, sorted: a parameter
 * the hard load read without a value nobody declared, so its count is the branch that parameter's
 * absence takes.
 */
export function unsetParameters(read: Iterable<string>, url: URL, bare: readonly string[] = []): string[] {
  const carried = new URL(url.href).searchParams;
  return [...new Set(read)].filter((name) => !carried.has(name) && !bare.includes(name)).sort();
}

/** Why a route fails for reading `unset`, telling it how to declare each one. */
export function unsetParametersMessage(route: string, unset: readonly string[], override: string): string {
  return (
    `${route} reads the query parameter${unset.length === 1 ? '' : 's'} ${unset.join(', ')} that its hard load did not carry, ` +
    `so its count is the screen without ${unset.length === 1 ? 'it' : 'them'}: name the value people open it with in its ` +
    `${override} search, or list a parameter it reads on purpose with no value in bareParams`
  );
}
// dry-copy-end
