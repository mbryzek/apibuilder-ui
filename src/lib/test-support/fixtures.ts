import type { Operation, Service } from '$generated/com-bryzek-apibuilder-spec';
import { Method } from '$generated/com-bryzek-apibuilder-spec';

/**
 * A signed-in session, as `App.Locals` carries it.
 *
 * `user` is deliberately partial: every guard and action under test reads `user.id` and nothing
 * else, so building a whole generated `User` would state a dependency that does not exist. The
 * cast lives here once rather than in each test file.
 */
export function session(overrides: { id?: string; user?: { id: string } } = {}): NonNullable<App.Locals['session']> {
  return { id: 'sess-1', user: { id: 'user-1' }, ...overrides } as NonNullable<App.Locals['session']>;
}

/** An apibuilder service with nothing declared in it. */
export function service(overrides: Partial<Service> = {}): Service {
  return {
    name: 'test',
    organization: { key: 'test-org' },
    application: { key: 'test-app' },
    namespace: 'io.test.v0',
    version: '1.0.0',
    info: {},
    imports: [],
    enums: [],
    interfaces: [],
    unions: [],
    models: [],
    resources: [],
    attributes: {},
    auth_schemes: [],
    ...overrides
  };
}

/** An unprotected `GET`, which is what an operation is until a test says otherwise. */
export function operation(overrides: Partial<Operation> = {}): Operation {
  return {
    method: Method.Get,
    path: '/events',
    parameters: [],
    responses: [],
    attributes: {},
    content_type: 'application/json',
    ...overrides
  };
}
