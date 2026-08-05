import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { throwIfUnavailable } from '$lib/api/load-error';
import type { Membership } from '$generated/com-bryzek-apibuilder';
import { MembershipRole } from '$generated/com-bryzek-apibuilder';

const UNAVAILABLE = 'We could not reach the server. Please try again in a moment.';

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

export async function requireMemberForAction(locals: App.Locals, orgKey: string): Promise<NonNullable<App.Locals['session']>> {
  const session = requireAuthForAction(locals);
  const headers = getSessionHeaders(session.id);
  const response = await handleApiCall<Membership[]>(() =>
    apiBuilderClient().getMemberships({ orgKey, userId: session.user.id, limit: 25, offset: 0, headers })
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
  const session = requireAuthForAction(locals);
  const headers = getSessionHeaders(session.id);
  const response = await handleApiCall<Membership[]>(() =>
    apiBuilderClient().getMemberships({ orgKey, userId: session.user.id, role: MembershipRole.Admin, limit: 25, offset: 0, headers })
  );
  throwIfUnavailable(response);
  if (!('data' in response) || response.data.length === 0) {
    throw error(403, 'Forbidden');
  }
  return session;
}
