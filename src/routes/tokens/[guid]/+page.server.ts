import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { dataOr, loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import { findScopedById, outOfScope } from '$lib/server/scoped-id';
import type { CleartextToken, Token } from '$generated/com-bryzek-platform';

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);

  const response = await handleApiCall<CleartextToken>(() => platformClient().getTokenCleartextById(event.params.guid, { headers }));

  return {
    tokenGuid: event.params.guid,
    cleartextToken: dataOr<CleartextToken | null>(response, null)?.token ?? null,
    // A 404 is the normal "already displayed" state — the cleartext is deliberately
    // unavailable after the first view. Every other failure is a failure, and saying
    // "already displayed" for it hides a token the user just created.
    loadError: response.status === 404 ? null : loadErrorFrom(response)
  };
};

export const actions: Actions = {
  delete: async ({ params, locals }) => {
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);

    // The route is authorized as "signed in" while the guid it deletes comes from the URL, so
    // confirm the token is one of the caller's own before deleting it. The cleartext endpoint is
    // deliberately NOT used to check this: it is a one-time claim, and reading it here would burn
    // the cleartext the page exists to show. See `$lib/server/scoped-id`.
    const token = await findScopedById<Token>(params.guid, (limit, offset) =>
      handleApiCall<Token[]>(() => platformClient().getTokensUsersByUserId({ userId: session.user.id, limit, offset, headers }))
    );
    if (!token) {
      return outOfScope();
    }

    const response = await handleApiCall<void>(() => platformClient().deleteTokenById(token.id, { headers }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    throw redirect(303, '/tokens');
  }
};
