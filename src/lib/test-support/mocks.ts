import { vi } from 'vitest';

/**
 * `$lib/api/clients` is mocked by every test that exercises a route module, and a mock that
 * declares only the factories its own subject happens to call today goes stale in silence: the
 * subject starts calling a sibling factory and gets `undefined` rather than the fake.
 *
 * The factories are `vi.fn`s rather than plain arrows because the session header now rides on
 * client CONSTRUCTION rather than on each operation call, so what a test asserts the session id
 * reached is the options the factory was called with — see `session-lifecycle.test.ts`.
 *
 * `getSessionHeaders` is deliberately not replaced — it is a pure function over `$lib/config`,
 * and the header it builds is part of what the session tests pin.
 */
export async function mockApiClients(
  client: unknown,
  importOriginal: <T = Record<string, unknown>>() => Promise<T>
): Promise<Record<string, unknown>> {
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    clients: vi.fn(() => ({ apibuilder: client, platform: client })),
    apiBuilderClient: vi.fn(() => client),
    generatorClient: vi.fn(() => client),
    platformClient: vi.fn(() => client)
  };
}
