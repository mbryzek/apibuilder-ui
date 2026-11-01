import { describe, expect, it } from 'vitest';
import type { Service } from '#generated/com-bryzek-apibuilder-spec.ts';
import { resolveType, type TypeWrapper } from './type-resolver';
import { service } from '#lib/test-support/fixtures.ts';

/**
 * The property under test is that `innerType` is what a table cell SHOWS and `href`/`anchor` is
 * where it goes. Those are independent: a namespace belongs in the link, never in the label, so
 * every resolution path displays a bare short name.
 */
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
        wrappers: [],
        innerType: name
      });
    });
  });

  describe('containers', () => {
    it.each<[string, TypeWrapper[]]>([
      ['string', []],
      ['[string]', ['array']],
      ['map[string]', ['map']],
      // Nested containers: peeled to the bare type, with the wrappers kept outermost-first so the
      // cell can render them back in the order they were written.
      ['[[string]]', ['array', 'array']],
      ['map[[string]]', ['map', 'array']],
      ['[map[string]]', ['array', 'map']],
      ['map[map[[string]]]', ['map', 'map', 'array']]
    ])('%s peels to the bare type with wrappers %j', (typeStr, wrappers) => {
      const resolved = resolveType(typeStr, service());
      expect(resolved.wrappers).toEqual(wrappers);
      expect(resolved.innerType).toBe('string');
    });

    it('keeps a local type linked however deeply it is nested', () => {
      const svc = service({ models: [model('user')] });

      expect(resolveType('map[[user]]', svc)).toEqual({
        anchor: 'user',
        href: null,
        wrappers: ['map', 'array'],
        innerType: 'user'
      });
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
        wrappers: [],
        innerType: 'user'
      });
    });
  });

  describe('namespace-qualified imported types', () => {
    const svc = service({ imports: [importedService('io.flow.common.v0')] });

    it('displays the short name and links to the importing service', () => {
      expect(resolveType('io.flow.common.v0.models.price', svc)).toEqual({
        anchor: null,
        href: '/flow/common/0.1.0#price',
        wrappers: [],
        innerType: 'price'
      });
    });

    it('displays the short name inside a container too', () => {
      const resolved = resolveType('[io.flow.common.v0.models.price]', svc);
      expect(resolved.innerType).toBe('price');
      expect(resolved.wrappers).toEqual(['array']);
      expect(resolved.href).toBe('/flow/common/0.1.0#price');
    });

    it('displays the short name inside a NESTED container too', () => {
      // The regression: one strip left `[io.flow.common.v0.models.price]` as the "bare" type, whose
      // namespace read as `[io.flow.common.v0.models`, matched no import, and lost both the link
      // and the short name that the un-nested form gets.
      expect(resolveType('map[[io.flow.common.v0.models.price]]', svc)).toEqual({
        anchor: null,
        href: '/flow/common/0.1.0#price',
        wrappers: ['map', 'array'],
        innerType: 'price'
      });
    });

    it.each(['enums', 'unions', 'interfaces'])('strips the %s kind segment as well', (kind) => {
      expect(resolveType(`io.flow.common.v0.${kind}.currency`, svc)).toMatchObject({
        href: '/flow/common/0.1.0#currency',
        innerType: 'currency'
      });
    });

    it('matches the import by its SERVICE namespace, which carries no kind segment', () => {
      // apibuilder writes `<service namespace>.models.<name>` and an import's namespace is the
      // service's own (`io.flow.common.v0`). An import whose namespace ends in `.models` exists in
      // no real spec; matching on it is what left every real imported type unlinked.
      const kindSuffixed = service({ imports: [importedService('io.flow.common.v0.models')] });
      expect(resolveType('io.flow.common.v0.models.price', kindSuffixed).href).toBeNull();
    });

    it("anchors a type qualified with the service's own namespace", () => {
      const local = service({ models: [model('user')] });
      expect(resolveType('io.test.v0.models.user', local)).toEqual({
        anchor: 'user',
        href: null,
        wrappers: [],
        innerType: 'user'
      });
    });

    it('keeps the qualified name when no import matches the namespace', () => {
      expect(resolveType('io.flow.unknown.v0.models.price', svc)).toEqual({
        anchor: null,
        href: null,
        wrappers: [],
        innerType: 'io.flow.unknown.v0.models.price'
      });
    });
  });

  describe('bare imported types', () => {
    it('links a bare name declared by an import', () => {
      const svc = service({
        imports: [importedService('io.flow.common.v0', { models: [model('price')] })]
      });

      expect(resolveType('price', svc)).toEqual({
        anchor: null,
        href: '/flow/common/0.1.0#price',
        wrappers: [],
        innerType: 'price'
      });

      expect(resolveType('map[[price]]', svc)).toEqual({
        anchor: null,
        href: '/flow/common/0.1.0#price',
        wrappers: ['map', 'array'],
        innerType: 'price'
      });
    });
  });

  it('displays an unknown bare type as-is with no link', () => {
    expect(resolveType('mystery', service())).toEqual({
      anchor: null,
      href: null,
      wrappers: [],
      innerType: 'mystery'
    });
  });
});
