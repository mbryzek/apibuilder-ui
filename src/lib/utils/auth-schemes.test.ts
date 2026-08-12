import { describe, expect, it } from 'vitest';
import type { AuthScheme, Operation, Resource, Service } from '$generated/com-bryzek-apibuilder-spec';
import { Method } from '$generated/com-bryzek-apibuilder-spec';
import { authSchemeAnchorId, authSchemes, declaresAuthScheme, isAuthSchemeAnchor, operationsProtectedBy } from './auth-schemes';

function operation(method: Method, path: string, auth?: string): Operation {
  return {
    method,
    path,
    parameters: [],
    responses: [],
    attributes: {},
    content_type: 'application/json',
    ...(auth === undefined ? {} : { auth: auth })
  };
}

function resource(type: string, operations: Operation[]): Resource {
  return { type, plural: `${type}s`, operations, attributes: {} };
}

function service(overrides: Partial<Service> = {}): Service {
  return {
    name: 'test',
    organization: { key: 'test-org' },
    application: { key: 'test-app' },
    namespace: 'test.namespace',
    version: '1.0.0',
    info: {},
    imports: [],
    enums: [],
    unions: [],
    models: [],
    resources: [],
    attributes: {},
    auth_schemes: [],
    ...overrides
  };
}

function scheme(type: string): AuthScheme {
  return { type, attributes: {} };
}

describe('authSchemeAnchorId', () => {
  it('namespaces the anchor so a scheme cannot collide with a type of the same name', () => {
    // Both a `session` scheme and a `session` model can exist in one service; two elements with
    // the same DOM id would send getElementById to whichever came first.
    expect(authSchemeAnchorId('session')).toBe('auth-scheme-session');
    expect(authSchemeAnchorId('session')).not.toBe('session');
  });
});

describe('isAuthSchemeAnchor', () => {
  it('recognizes a scheme anchor', () => {
    expect(isAuthSchemeAnchor(authSchemeAnchorId('hackathon_admin'))).toBe(true);
  });

  it('leaves every other anchor to the tab that owns it', () => {
    expect(isAuthSchemeAnchor('user')).toBe(false);
    expect(isAuthSchemeAnchor('auth')).toBe(false);
    expect(isAuthSchemeAnchor('auth-scheme')).toBe(false);
  });

  it('does not claim the bare prefix, which names no scheme', () => {
    expect(isAuthSchemeAnchor('auth-scheme-')).toBe(false);
  });
});

describe('authSchemes', () => {
  it('returns what the service declares', () => {
    expect(authSchemes(service({ auth_schemes: [scheme('session')] })).map((s) => s.type)).toEqual(['session']);
  });

  it('survives stored service JSON that predates the field', () => {
    // Required in the current spec, absent in versions uploaded before it existed. Reading
    // `.length` off undefined would take down the whole version page, not just this section.
    const legacy = service();
    delete (legacy as Partial<Service>).auth_schemes;
    expect(authSchemes(legacy)).toEqual([]);
  });
});

describe('declaresAuthScheme', () => {
  const svc = service({ auth_schemes: [scheme('session'), scheme('hackathon_admin')] });

  it('is true for a declared scheme', () => {
    expect(declaresAuthScheme(svc, 'hackathon_admin')).toBe(true);
  });

  it('is false for one the service never declared', () => {
    expect(declaresAuthScheme(svc, 'admin')).toBe(false);
  });
});

describe('operationsProtectedBy', () => {
  const svc = service({
    auth_schemes: [scheme('hackathon_admin')],
    resources: [
      resource('event', [
        operation(Method.Get, '/admin/events', 'hackathon_admin'),
        operation(Method.Post, '/admin/events', 'hackathon_admin'),
        operation(Method.Get, '/admin/events/public-feed', 'none'),
        operation(Method.Get, '/events')
      ]),
      resource('user', [operation(Method.Get, '/admin/users', 'hackathon_admin')])
    ]
  });

  it('collects matching operations across every resource, carrying the anchor to link at', () => {
    expect(operationsProtectedBy(svc, 'hackathon_admin')).toEqual([
      { resourceType: 'event', method: 'GET', path: '/admin/events' },
      { resourceType: 'event', method: 'POST', path: '/admin/events' },
      { resourceType: 'user', method: 'GET', path: '/admin/users' }
    ]);
  });

  it('never matches an operation that carries no auth at all', () => {
    // An absent `auth` must not collide with a falsy scheme name — the exhaustive expectation
    // above already shows `/events` (no auth) and the `none` operation are both left out.
    expect(operationsProtectedBy(svc, '')).toEqual([]);
  });

  it('is empty for a declared-but-unused scheme, which is itself worth showing', () => {
    expect(operationsProtectedBy(svc, 'session')).toEqual([]);
  });
});
