import { describe, expect, it } from 'vitest';
import type { Field, Parameter } from '$generated/com-bryzek-apibuilder-spec';
import { ParameterLocation } from '$generated/com-bryzek-apibuilder-spec';
import { anyPropertyDetails, propertyDetails, type PropertyRow } from './spec-properties';

function field(over: Partial<Field> = {}): Field {
  return { name: 'f', type: 'string', required: false, attributes: {}, ...over };
}

function parameter(over: Partial<Parameter> = {}): Parameter {
  return { name: 'p', type: 'string', location: ParameterLocation.Query, required: false, attributes: {}, ...over };
}

function texts(row: PropertyRow): string[] {
  return propertyDetails(row).map((d) => `${d.kind}:${d.text}`);
}

describe('propertyDetails', () => {
  it('says nothing about a field that declares nothing', () => {
    expect(propertyDetails(field())).toEqual([]);
  });

  it('orders the parts the same way for a field and a parameter', () => {
    const common = { default: 'd', minimum: 1, maximum: 2, description: 'desc', example: 'ex' };
    expect(texts(field(common))).toEqual(['default:default: d', 'range:min: 1, max: 2', 'description:desc', 'example:e.g. ex']);
    expect(texts(parameter(common))).toEqual([
      'location:Query',
      'default:default: d',
      'range:min: 1, max: 2',
      'description:desc',
      'example:e.g. ex'
    ]);
  });

  it('renders whichever end of a range is declared', () => {
    expect(texts(field({ minimum: 0 }))).toEqual(['range:min: 0']);
    expect(texts(field({ maximum: 9 }))).toEqual(['range:max: 9']);
  });

  it('keeps a falsy value that a spec can legitimately declare', () => {
    // `0` and `''` are values, not absences: truthiness would drop both.
    expect(texts(field({ minimum: 0, default: '' }))).toEqual(['default:default: ', 'range:min: 0']);
  });

  it('drops a value the API sent as null rather than omitting', () => {
    // Stored service JSON predates parts of the spec, so a null can arrive where the generated
    // type promises `number | undefined` — `min: null` is worse than no range at all.
    const nulled = { minimum: null, maximum: null, default: null } as unknown as PropertyRow;
    expect(propertyDetails({ ...field(), ...nulled })).toEqual([]);
  });

  it('treats empty free text as nothing to say', () => {
    expect(texts(field({ description: '', example: '' }))).toEqual([]);
  });
});

describe('anyPropertyDetails', () => {
  it('is false when no row fills the column', () => {
    expect(anyPropertyDetails([field(), field({ name: 'g', required: true })])).toBe(false);
  });

  it('is true when a single row does', () => {
    expect(anyPropertyDetails([field(), field({ name: 'g', description: 'why' })])).toBe(true);
  });

  it('is true for any parameter, because location is required', () => {
    expect(anyPropertyDetails([parameter()])).toBe(true);
  });

  it('is false for no rows at all', () => {
    expect(anyPropertyDetails([])).toBe(false);
  });
});
