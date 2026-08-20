import type { Service } from '$generated/com-bryzek-apibuilder-spec';

const PRIMITIVES = new Set([
  'boolean',
  'bytes',
  'date-iso8601',
  'date-time-iso8601',
  'decimal',
  'double',
  'integer',
  'json',
  'long',
  'object',
  'string',
  'time-iso8601',
  'unit',
  'uuid'
]);

export type TypeWrapper = 'array' | 'map';

export interface ResolvedType {
  anchor: string | null;
  href: string | null;
  /** The containers around `innerType`, outermost first: `map[[user]]` is `['map', 'array']`. */
  wrappers: TypeWrapper[];
  /** The bare type, with every container peeled off. */
  innerType: string;
}

/** Where a bare type name points, once the containers are off it. */
type Target = Pick<ResolvedType, 'anchor' | 'href' | 'innerType'>;

/**
 * Peel every container off a type string, keeping the order they were in.
 *
 * Peeled to the BARE type, not one level: apibuilder nests containers freely, and a single strip
 * leaves `map[[io.flow.common.v0.models.price]]` holding `[io.flow.common.v0.models.price]`, whose
 * namespace then reads as `[io.flow.common.v0.models` — matching no import, so the cell shows the
 * whole qualified string with no link while the un-nested form shows a linked `price`.
 */
function parseTypeString(typeStr: string): { inner: string; wrappers: TypeWrapper[] } {
  const wrappers: TypeWrapper[] = [];
  let inner = typeStr.trim();

  for (;;) {
    if (inner.startsWith('map[') && inner.endsWith(']')) {
      wrappers.push('map');
      inner = inner.slice(4, -1).trim();
    } else if (inner.startsWith('[') && inner.endsWith(']')) {
      wrappers.push('array');
      inner = inner.slice(1, -1).trim();
    } else {
      return { inner, wrappers };
    }
  }
}

/**
 * Check if a type name exists in the local service spec
 */
function findLocalType(name: string, service: Service): string | null {
  if (service.enums.some((e) => e.name === name)) return 'enum';
  if (service.models.some((m) => m.name === name)) return 'model';
  if (service.unions.some((u) => u.name === name)) return 'union';
  if (service.interfaces?.some((i) => i.name === name)) return 'interface';
  return null;
}

/**
 * Check if a type is imported from another service
 */
function findImportedType(name: string, imports: Service[]): Service | null {
  for (const imp of imports) {
    if (imp.enums.some((e) => e.name === name) || imp.models.some((m) => m.name === name) || imp.unions.some((u) => u.name === name)) {
      return imp;
    }
    if (imp.interfaces?.some((i) => i.name === name)) {
      return imp;
    }
  }
  return null;
}

function importHref(imp: Service, name: string): string {
  return `/${imp.organization.key}/${imp.application.key}/${imp.version}#${encodeURIComponent(name)}`;
}

/** Where a bare type name — no containers left on it — is displayed and links to. */
function resolveBareType(inner: string, service: Service): Target {
  const nowhere: Target = { anchor: null, href: null, innerType: inner };

  if (PRIMITIVES.has(inner)) {
    return nowhere;
  }

  // A namespace-qualified type names its import directly.
  if (inner.includes('.')) {
    const parts = inner.split('.');
    const shortName = parts[parts.length - 1]!;
    const namespace = parts.slice(0, -1).join('.');

    const matchingImport = service.imports.find((imp) => imp.namespace === namespace);
    if (!matchingImport) {
      // No import to link to, so the qualified string is all there is to show.
      return nowhere;
    }
    // Display the short name — every other resolution path displays a bare name, and the
    // namespace is already carried by the href.
    return { anchor: null, href: importHref(matchingImport, shortName), innerType: shortName };
  }

  if (findLocalType(inner, service)) {
    return { anchor: inner, href: null, innerType: inner };
  }

  const imp = findImportedType(inner, service.imports);
  if (imp) {
    return { anchor: null, href: importHref(imp, inner), innerType: inner };
  }

  // Unknown type — just display as-is.
  return nowhere;
}

/**
 * Resolve a type string to its display name, anchor link, and navigation href
 */
export function resolveType(typeStr: string, service: Service): ResolvedType {
  const { inner, wrappers } = parseTypeString(typeStr);
  return { ...resolveBareType(inner, service), wrappers };
}
