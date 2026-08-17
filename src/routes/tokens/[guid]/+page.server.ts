import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { platformClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth, requireAuthForAction } from '$lib/server/auth';
import { findScopedById, outOfScope } from '$lib/server/scoped-id';
import type { Token } from '$generated/com-bryzek-platform';

/**
 * The token's own page: what it is, and the button that revokes it.
 *
 * It does NOT show the token value, and there is no state in which it could. The platform stores
 * only a digest, so the value exists once — in the response to the mint, which `/tokens/create`
 * renders. A holder who did not keep it mints another.
 *
 * Resolved through `findScopedById` rather than by fetching the guid directly, for the reason the
 * delete action below needs it: the route is authorized as "signed in" while the guid comes from
 * the URL, so the id must be a selector among rows the caller was already entitled to.
 */
export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const headers = getSessionHeaders(session.id);

  const token = await findScopedById<Token>(event.params.guid, (limit, offset) =>
    handleApiCall<Token[]>(() => platformClient().getTokensUsersByUserId({ userId: session.user.id, limit, offset, headers }))
  );
  if (!token) {
    throw error(404, 'Not found');
  }

  return { token };
};

export const actions: Actions = {
  delete: async ({ params, locals }) => {
    const session = requireAuthForAction(locals);
    const headers = getSessionHeaders(session.id);

    // See `$lib/server/scoped-id`: the guid is a selector among the caller's own tokens, never an
    // id trusted straight from the URL.
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
