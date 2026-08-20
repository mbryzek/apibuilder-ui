import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { throwIfUnavailable } from '$lib/api/load-error';
import { UNAVAILABLE } from '$lib/api/api-message';
import { assertSafeSegment } from '$lib/server/path-params';
import type { Membership } from '$generated/com-bryzek-apibuilder';
import { MembershipRole } from '$generated/com-bryzek-apibuilder';

/**
 * Stop before sending someone to sign in when we never learned whether they already are.
 *
 * `locals.session` is absent both for a genuinely anonymous request and for one whose session
 * lookup never got an answer (see `hooks.server.ts`). Telling the second case to sign in is a
 * lie that costs the user whatever they had typed, and signing in again fails too, because the
 * platform that could not answer is the same one that would have to authenticate them.
 */
function assertSessionKnown(locals: App.Locals): void {
  if (locals.sessionUnavailable) {
    throw error(503, UNAVAILABLE);
  }
}

export function requireAuth(event: RequestEvent): NonNullable<App.Locals['session']> {
  const { locals, url } = event;
  if (!locals.session) {
    assertSessionKnown(locals);
    const redirectTo = url.pathname + url.search;
    throw redirect(303, '/login?redirect=' + encodeURIComponent(redirectTo));
  }
  return locals.session;
}

export function requireAuthForAction(locals: App.Locals): NonNullable<App.Locals['session']> {
  if (!locals.session) {
    assertSessionKnown(locals);
    throw redirect(302, '/login');
  }
  return locals.session;
}

/**
 * Validate `orgKey` here, so an action that authorizes through these helpers cannot forget to.
 *
 * Actions never run the load pipeline, so none of them inherits the `assertSafePathParams` their
 * route's loads run. Doing it inside the two membership guards covers every org-scoped action
 * that requires membership without a per-action call.
 *
 * It does NOT cover an action that only requires a session: `requireAuthForAction` validates
 * nothing about the route, so an action using it — `[appKey]/[version]`'s watch and unwatch,
 * `memberships/request` — calls `assertSafePathParams` itself. `org-authorization.test.ts` walks
 * the org-scoped actions and asserts each one refuses a hostile key, which is what keeps that
 * true for the next action added rather than this comment.
 *
 * What it closes is an open redirect, not the SSRF the guard was originally written for: the
 * generated client percent-encodes every interpolated path param, but several actions reflect
 * `params.orgKey` into `redirect(303, `/${params.orgKey}/...`)`, and SvelteKit decodes `%2F`
 * before a handler sees it — so an `orgKey` of `/evil.com` produces a scheme-relative
 * `Location: //evil.com/...`. SvelteKit sets `Location` verbatim.
 */
function assertSafeOrgKey(orgKey: string): void {
  assertSafeSegment(orgKey, 'orgKey');
}

export async function requireMemberForAction(locals: App.Locals, orgKey: string): Promise<NonNullable<App.Locals['session']>> {
  assertSafeOrgKey(orgKey);
  const session = requireAuthForAction(locals);
  const headers = getSessionHeaders(session.id);
  const response = await handleApiCall<Membership[]>(() =>
    apiBuilderClient({ headers }).getMemberships({ orgKey, userId: session.user.id, limit: 25, offset: 0 })
  );
  // An unanswered membership lookup is not a denial: reporting "Forbidden" for an
  // outage tells a member their access was revoked.
  throwIfUnavailable(response);
  if (!('data' in response) || response.data.length === 0) {
    throw error(403, 'Forbidden');
  }
  return session;
}

export async function requireAdminForAction(locals: App.Locals, orgKey: string): Promise<NonNullable<App.Locals['session']>> {
  assertSafeOrgKey(orgKey);
  const session = requireAuthForAction(locals);
  const headers = getSessionHeaders(session.id);
  const response = await handleApiCall<Membership[]>(() =>
    apiBuilderClient({ headers }).getMemberships({ orgKey, userId: session.user.id, role: MembershipRole.Admin, limit: 25, offset: 0 })
  );
  throwIfUnavailable(response);
  if (!('data' in response) || response.data.length === 0) {
    throw error(403, 'Forbidden');
  }
  return session;
}

/**
 * A client already carrying the caller's session, handed back with the session it authorized.
 *
 * Every org-scoped action needs the same three lines — authorize, build the headers, build the
 * client — and repeating them is what let two sites drop the returned session and reach around it
 * with `locals.session!`, telling the compiler something the guard had already proved. Returning
 * both leaves nothing to re-derive.
 */
export interface AuthorizedClient {
  session: NonNullable<App.Locals['session']>;
  client: ReturnType<typeof apiBuilderClient>;
}

function clientFor(session: NonNullable<App.Locals['session']>): AuthorizedClient {
  return { session, client: apiBuilderClient({ headers: getSessionHeaders(session.id) }) };
}

/** Authorize an org admin and hand back a client acting as them. */
export async function adminClient(locals: App.Locals, orgKey: string): Promise<AuthorizedClient> {
  return clientFor(await requireAdminForAction(locals, orgKey));
}

/** Authorize an org member and hand back a client acting as them. */
export async function memberClient(locals: App.Locals, orgKey: string): Promise<AuthorizedClient> {
  return clientFor(await requireMemberForAction(locals, orgKey));
}

/**
 * The load for a page that renders a form and nothing else: it needs a signed-in reader and no
 * data. Written once so the sites that share it cannot drift apart, and so that a page which
 * later needs data has to say so by replacing this rather than by editing a copy.
 */
export function requireAuthLoad(event: RequestEvent): Record<string, never> {
  requireAuth(event);
  return {};
}
