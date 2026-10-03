import { fail } from '@sveltejs/kit';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { adminClient, type AuthorizedClient } from '$lib/server/auth';
import { requiredString } from '$lib/server/form';
import { findScopedById, outOfScope, type FetchPage } from '$lib/server/scoped-id';

/**
 * An org-admin form action that acts on ONE row named by a hidden `guid` field.
 *
 * Every such action is the confused-deputy guard from `$lib/server/scoped-id` plus one API call:
 * authorize `params.orgKey`, read the guid, resolve it within that org's listing, act on the row
 * that came back. Written once so the scope lookup is not something a new action can forget —
 * an action built on this cannot reach `act` with an id the org listing did not return.
 *
 * Order is part of the contract: authorization comes before the body is read, so a non-admin is
 * refused without anything about their submission being looked at; a blank guid is refused with
 * 400 before any listing is scanned; a guid outside the org is `outOfScope()`'s 404.
 */

/** The refusal for a missing or blank `guid`. The field is hidden, so nobody filling in the form can fix it. */
export const INVALID_REQUEST = 'Invalid request';

export type AdminActionEvent = {
  request: Request;
  locals: App.Locals;
  params: { orgKey: string };
};

/** The listing that defines the scope, for the org that was authorized. */
export type OrgScope<T> = (client: AuthorizedClient['client'], orgKey: string) => FetchPage<T>;

export async function adminGuidAction<T extends { id: string }>(
  { request, locals, params }: AdminActionEvent,
  scope: OrgScope<T>,
  act: (row: T, client: AuthorizedClient['client']) => Promise<unknown>
) {
  const { client } = await adminClient(locals, params.orgKey);
  const guid = requiredString(await request.formData(), 'guid');

  if (!guid) {
    return fail(400, { errors: [{ message: INVALID_REQUEST }] });
  }

  const row = await findScopedById(guid, scope(client, params.orgKey));
  if (!row) {
    return outOfScope();
  }

  const response = await handleApiCall<unknown>(() => act(row, client));

  if (isApiError(response)) {
    return actionFail(response);
  }

  return { success: true };
}
