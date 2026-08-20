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

/**
 * `$lib/server/auth` mocked for a test that is exercising what an action DOES, not who it lets in.
 *
 * Same reason as the client mock above: a hand-written object listing the guards a module happens
 * to import today breaks the moment it imports another one, with an error about the mock rather
 * than about the code. Spreading the real module and overriding only the guards keeps every other
 * export — `requireAuthLoad`, and whatever comes next — real and present.
 *
 * `adminClient` / `memberClient` hand back the same double the client mock does, so an action
 * built through them talks to the test's client.
 */
export async function mockServerAuth(
  session: unknown,
  client: unknown,
  importOriginal: <T = Record<string, unknown>>() => Promise<T>
): Promise<Record<string, unknown>> {
  const authorized = { session, client };
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    requireAuth: () => session,
    requireAuthForAction: () => session,
    requireMemberForAction: async () => session,
    requireAdminForAction: async () => session,
    adminClient: async () => authorized,
    memberClient: async () => authorized
  };
}
