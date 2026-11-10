/**
 * A mocked API client whose methods drop the call context a call site hands them first, so a unit
 * test's `vi.fn` sees and asserts the call's own arguments, as it did before the client took a
 * context (DES-65431). Every function is wrapped in a Proxy, so the mock's own properties
 * (`.mock`, `.mockResolvedValue`) still read through the client; a nested object (a client bundle
 * such as `clients().platform`) is wrapped the same way.
 *
 * A route's budget test uses `expectWithinBudget` instead, which records the contexts themselves.
 */
function isCallContext(value: unknown): boolean {
  return typeof value === 'object' && value !== null && 'recorder' in value && 'part' in value && 'view' in value;
}

/** One proxy per mock, so a client handed out twice is the same object both times. */
const wrappedMocks = new WeakMap<object, unknown>();

export function withoutContext<T>(client: T): T {
  if ((typeof client !== 'object' && typeof client !== 'function') || client === null) return client;
  const known = wrappedMocks.get(client as object);
  if (known !== undefined) return known as T;
  const wrapped = wrap(client as object);
  wrappedMocks.set(client as object, wrapped);
  return wrapped as T;
}

function wrap(client: object): unknown {
  if (typeof client === 'function') {
    return new Proxy(client, {
      apply: (target, self, args: unknown[]) => Reflect.apply(target, self, isCallContext(args[0]) ? args.slice(1) : args)
    });
  }
  return new Proxy(client, {
    get: (target, key, receiver) => {
      const value: unknown = Reflect.get(target, key, receiver);
      return typeof value === 'function' || (typeof value === 'object' && value !== null && !Array.isArray(value))
        ? withoutContext(value)
        : value;
    }
  });
}

/**
 * A mocked module whose functions drop the call context they are handed first, and whose every
 * `...Client` factory hands back its client {@link withoutContext}:
 *
 *     vi.mock('#lib/api/clients.ts', async () =>
 *       (await import('#lib/test-support/withoutContext.ts')).moduleWithoutContext({ platformApiClient: () => client }));
 *
 * Imported inside the factory, because a hoisted factory runs before the test file's own imports
 * are initialized. Each function is wrapped in a Proxy, so a test asserting on it still reads its
 * mock. A factory spreading `importOriginal()` is not wrapped: the real functions need the context.
 */
export function moduleWithoutContext<T extends object>(module: T): T {
  const wrapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(module)) {
    wrapped[key] =
      typeof value !== 'function'
        ? value
        : /Client$/.test(key)
          ? new Proxy(value, { apply: (target, self, args: unknown[]) => withoutContext(Reflect.apply(target, self, args)) })
          : withoutContext(value);
  }
  return wrapped as T;
}

/**
 * {@link moduleWithoutContext} for a factory spreading `importOriginal()`: only the `...Client`
 * factories are wrapped, so the real functions beside them still receive their context.
 */
export function clientsWithoutContext<T extends object>(module: T): T {
  const wrapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(module)) {
    wrapped[key] =
      typeof value === 'function' && /Client$/.test(key)
        ? new Proxy(value, { apply: (target, self, args: unknown[]) => withoutContext(Reflect.apply(target, self, args)) })
        : value;
  }
  return wrapped as T;
}
