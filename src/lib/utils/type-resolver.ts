import type { Service, Import } from '$generated/types';

const PRIMITIVES = new Set([
	'boolean', 'date-iso8601', 'date-time-iso8601', 'decimal', 'double',
	'integer', 'long', 'object', 'json', 'string', 'unit', 'uuid',
]);

export interface ResolvedType {
	anchor: string | null;
	href: string | null;
	isArray: boolean;
	isMap: boolean;
	innerType: string;
}

/**
 * Parse a type string like "[string]", "map[user]", or plain "user"
 */
function parseTypeString(typeStr: string): { inner: string; isArray: boolean; isMap: boolean } {
	if (typeStr.startsWith('[') && typeStr.endsWith(']')) {
		return { inner: typeStr.slice(1, -1), isArray: true, isMap: false };
	}
	if (typeStr.startsWith('map[') && typeStr.endsWith(']')) {
		return { inner: typeStr.slice(4, -1), isArray: false, isMap: true };
	}
	return { inner: typeStr, isArray: false, isMap: false };
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
function findImportedType(name: string, imports: Import[]): Import | null {
	for (const imp of imports) {
		if (imp.enums.includes(name) || imp.models.includes(name) || imp.unions.includes(name)) {
			return imp;
		}
		if (imp.interfaces?.includes(name)) {
			return imp;
		}
	}
	return null;
}

/**
 * Resolve a type string to its display name, anchor link, and navigation href
 */
export function resolveType(typeStr: string, service: Service): ResolvedType {
	const { inner, isArray, isMap } = parseTypeString(typeStr);

	// Check if it's a primitive
	if (PRIMITIVES.has(inner)) {
		return {

			anchor: null,
			href: null,
			isArray,
			isMap,
			innerType: inner,
		};
	}

	// Check for namespace-qualified type (imported)
	if (inner.includes('.')) {
		const parts = inner.split('.');
		const shortName = parts[parts.length - 1]!;
		const namespace = parts.slice(0, -1).join('.');

		// Find matching import
		const matchingImport = service.imports.find((imp) => imp.namespace === namespace);
		if (matchingImport) {
			return {
	
				anchor: null,
				href: `/${matchingImport.organization.key}/${matchingImport.application.key}/${matchingImport.version}#${encodeURIComponent(shortName)}`,
				isArray,
				isMap,
				innerType: inner,
			};
		}

		return {

			anchor: null,
			href: null,
			isArray,
			isMap,
			innerType: inner,
		};
	}

	// Check local types
	const localKind = findLocalType(inner, service);
	if (localKind) {
		return {

			anchor: inner,
			href: null,
			isArray,
			isMap,
			innerType: inner,
		};
	}

	// Check imports
	const imp = findImportedType(inner, service.imports);
	if (imp) {
		return {

			anchor: null,
			href: `/${imp.organization.key}/${imp.application.key}/${imp.version}#${encodeURIComponent(inner)}`,
			isArray,
			isMap,
			innerType: inner,
		};
	}

	// Unknown type — just display as-is
	return {
		anchor: null,
		href: null,
		isArray,
		isMap,
		innerType: inner,
	};
}
