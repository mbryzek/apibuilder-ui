/**
 * `$lib/api/clients` is mocked by every test that exercises a route module, and a mock that
 * declares only the factories its own subject happens to call today goes stale in silence: the
 * subject starts calling a sibling factory and gets `undefined` rather than the fake.
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
    clients: () => ({ apibuilder: client, platform: client }),
    apiBuilderClient: () => client,
    generatorClient: () => client,
    platformClient: () => client
  };
}
