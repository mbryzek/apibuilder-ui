import type { AuthScheme, Service } from '$generated/com-bryzek-apibuilder-spec';

/**
 * The reserved `operation.auth` value. It marks an operation explicitly public and, per the spec,
 * cannot be declared as an `auth_scheme.type` — so it never resolves to a scheme card.
 */
export const PUBLIC_AUTH = 'none';

const ANCHOR_PREFIX = 'auth-scheme-';

/**
 * The DOM id of a scheme's card.
 *
 * Prefixed rather than bare because every other anchor in the spec view is a type NAME (`#user`,
 * `#event`) while a scheme type is a free-form string. A service with a `session` scheme and a
 * `session` model would otherwise render two elements with the same id, and `getElementById`
 * scrolls to whichever the document happens to hold first.
 */
export function authSchemeAnchorId(schemeType: string): string {
  return `${ANCHOR_PREFIX}${schemeType}`;
}

/** True when a location hash addresses a scheme card, so the tab holding it can be selected. */
export function isAuthSchemeAnchor(hash: string): boolean {
  return hash.startsWith(ANCHOR_PREFIX) && hash.length > ANCHOR_PREFIX.length;
}

/**
 * The schemes a service declares.
 *
 * `auth_schemes` is required in the current spec, but this view renders stored service JSON that
 * can predate the field by years — and an absent array would be a `TypeError` on `.length` that
 * takes the whole version page down rather than one section of it.
 */
export function authSchemes(service: Service): AuthScheme[] {
  return service.auth_schemes ?? [];
}

/** Whether the service declares `schemeType`, which decides if an operation badge can link to it. */
export function declaresAuthScheme(service: Service, schemeType: string): boolean {
  return authSchemes(service).some((s) => s.type === schemeType);
}

/** An operation a scheme protects, identified the way the reader navigates to it. */
export interface ProtectedOperation {
  /** The resource holding the operation — its type is the anchor the spec view scrolls to. */
  resourceType: string;
  method: string;
  path: string;
}

/**
 * Every operation in the service whose effective auth is `schemeType`.
 *
 * Reading a scheme card without this answers "what is declared" but not "what does it guard",
 * which is the question a reader arrives with. `operation.auth` already carries the effective
 * value — apibuilder materializes resource-level inheritance before emitting the spec — so there
 * is nothing to re-derive here.
 */
export function operationsProtectedBy(service: Service, schemeType: string): ProtectedOperation[] {
  return service.resources.flatMap((resource) =>
    resource.operations
      .filter((operation) => operation.auth === schemeType)
      .map((operation) => ({ resourceType: resource.type, method: operation.method, path: operation.path }))
  );
}
