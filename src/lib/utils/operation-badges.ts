import type { Operation, Service } from '$generated/com-bryzek-apibuilder-spec';
import { authSchemeAnchorId, declaresAuthScheme, PUBLIC_AUTH } from './auth-schemes';

/**
 * What `content_type` is when nobody sets it. The spec's own documentation states the default, and
 * repeating `application/json` on every operation of every service would be a badge that carries
 * no information — only an override tells the reader anything.
 */
export const DEFAULT_CONTENT_TYPE = 'application/json';

export interface AuthBadge {
  /**
   * `protected` reads as "an auth check is generated", `public` is the explicit `none` marker, and
   * `undeclared` is a broken spec — an `auth` value the service never declares.
   */
  kind: 'protected' | 'public' | 'undeclared';
  label: string;
  /** Anchor to the scheme's card, or null when the service declares no scheme of that type. */
  href: string | null;
  /** Longer explanation, rendered as the badge's title. */
  title: string;
}

/**
 * The auth badge for an operation, or null when there is nothing to say.
 *
 * Three cases, and the third is the reason this is a function rather than a template conditional:
 *
 * - a scheme type — the operation is protected, and the badge links to what that scheme is;
 * - `none` — explicitly public, which is worth showing because it is how an operation opts out of
 *   an otherwise-protected resource;
 * - ABSENT — treated as public today, and rendered as nothing. Every operation of every service
 *   uploaded before `auth` existed is in this state, so a "public" badge on all of them would be a
 *   page of chips that distinguish nothing. The spec notes a future revision will require the
 *   field; when that lands, absent stops occurring rather than needing different handling here.
 */
export function operationAuthBadge(operation: Operation, service: Service): AuthBadge | null {
  const auth = operation.auth?.trim();
  if (!auth) return null;

  if (auth === PUBLIC_AUTH) {
    return {
      kind: 'public',
      label: 'public',
      href: null,
      title: 'Explicitly public — generators emit no auth check for this operation.'
    };
  }

  if (declaresAuthScheme(service, auth)) {
    return {
      kind: 'protected',
      label: `auth: ${auth}`,
      href: `#${authSchemeAnchorId(auth)}`,
      title: `Requires the ${auth} auth scheme.`
    };
  }

  // The spec requires every `auth` value to be declared, so this is a broken service. The state
  // is carried in the LABEL and not only in the title: a title is unreachable on touch and
  // invisible to a screen reader, which would leave colour as the whole signal.
  return {
    kind: 'undeclared',
    label: `auth: ${auth} (undeclared)`,
    href: null,
    title: `Requires the ${auth} auth scheme, which this service does not declare in auth_schemes.`
  };
}

/**
 * The request body's Content-Type when it is not the default, else null.
 *
 * Compared case-insensitively because `Application/JSON` is the same media type and a badge
 * reading "this one is different" about an identical value is worse than no badge at all. The
 * optional chain is for the same reason `authSchemes()` has one: the field is required in the
 * current spec, but this view renders stored JSON that can predate it.
 */
export function operationContentTypeBadge(operation: Operation): string | null {
  const contentType = operation.content_type?.trim();
  if (!contentType) return null;
  return contentType.toLowerCase() === DEFAULT_CONTENT_TYPE ? null : contentType;
}
