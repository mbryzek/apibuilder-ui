import { describe, expect, it } from 'vitest';
import type { Service } from '$generated/com-bryzek-apibuilder-spec';
import { resolveType } from './type-resolver';

/**
 * The property under test is that `innerType` is what a table cell SHOWS and `href`/`anchor` is
 * where it goes. Those are independent: a namespace belongs in the link, never in the label, so
 * every resolution path displays a bare short name.
 */
function service(overrides: Partial<Service> = {}): Service {
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

function importedService(namespace: string, overrides: Partial<Service> = {}): Service {
  return service({
    namespace,
    organization: { key: 'flow' },
    application: { key: 'common' },
    version: '0.1.0',
    ...overrides
  });
}

const model = (name: string) => ({ name, plural: `${name}s`, fields: [], attributes: {} });
const enumType = (name: string) => ({ name, plural: `${name}s`, values: [], attributes: {} });
const union = (name: string) => ({ name, plural: `${name}s`, variants: [], attributes: {} });

describe('resolveType', () => {
  describe('primitives', () => {
    it.each(['string', 'uuid', 'date-time-iso8601', 'long'])('%s links nowhere', (name) => {
      expect(resolveType(name, service())).toEqual({
        anchor: null,
        href: null,
        isArray: false,
        isMap: false,
        innerType: name
      });
    });
  });

  describe('containers', () => {
    it.each<[string, boolean, boolean]>([
      ['string', false, false],
      ['[string]', true, false],
      ['map[string]', false, true]
    ])('%s parses to isArray=%s isMap=%s', (typeStr, isArray, isMap) => {
      const resolved = resolveType(typeStr, service());
      expect([resolved.isArray, resolved.isMap]).toEqual([isArray, isMap]);
      expect(resolved.innerType).toBe('string');
    });
  });

  describe('local types', () => {
    it.each([
      ['model', service({ models: [model('user')] })],
      ['enum', service({ enums: [enumType('user')] })],
      ['union', service({ unions: [union('user')] })],
      ['interface', service({ interfaces: [model('user')] })]
    ])('anchors a local %s to itself', (_kind, svc) => {
      expect(resolveType('user', svc)).toEqual({
        anchor: 'user',
        href: null,
        isArray: false,
        isMap: false,
        innerType: 'user'
      });
    });
  });

  describe('namespace-qualified imported types', () => {
    const svc = service({ imports: [importedService('io.flow.common.v0.models')] });

    it('displays the short name and links to the importing service', () => {
      expect(resolveType('io.flow.common.v0.models.price', svc)).toEqual({
        anchor: null,
        href: '/flow/common/0.1.0#price',
        isArray: false,
        isMap: false,
        innerType: 'price'
      });
    });

    it('displays the short name inside a container too', () => {
      const resolved = resolveType('[io.flow.common.v0.models.price]', svc);
      expect(resolved.innerType).toBe('price');
      expect(resolved.isArray).toBe(true);
      expect(resolved.href).toBe('/flow/common/0.1.0#price');
    });

    it('keeps the qualified name when no import matches the namespace', () => {
      expect(resolveType('io.flow.unknown.v0.models.price', svc)).toEqual({
        anchor: null,
        href: null,
        isArray: false,
        isMap: false,
        innerType: 'io.flow.unknown.v0.models.price'
      });
    });
  });

  describe('bare imported types', () => {
    it('links a bare name declared by an import', () => {
      const svc = service({
        imports: [importedService('io.flow.common.v0.models', { models: [model('price')] })]
      });

      expect(resolveType('price', svc)).toEqual({
        anchor: null,
        href: '/flow/common/0.1.0#price',
        isArray: false,
        isMap: false,
        innerType: 'price'
      });
    });
  });

  it('displays an unknown bare type as-is with no link', () => {
    expect(resolveType('mystery', service())).toEqual({
      anchor: null,
      href: null,
      isArray: false,
      isMap: false,
      innerType: 'mystery'
    });
  });
});
