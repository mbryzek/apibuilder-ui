import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail, actionFailMissing } from '$lib/api/action-error';
import { loadErrorFrom } from '$lib/api/load-error';
import { requireAuth, requireAdminForAction } from '$lib/server/auth';
import { requiredEnum } from '$lib/server/form';
import { redirectWithFlash } from '$lib/server/flash';
import type { Application } from '$generated/com-bryzek-apibuilder';
import { Visibility } from '$generated/com-bryzek-apibuilder';

/**
 * The application itself, not the org and not the spec.
 *
 * The visibility control edits `Application.visibility`, and `ApplicationForm` carries `name` and
 * `description` alongside it — so both the value the control starts on and the fields the update
 * must preserve come from this one lookup. Neither is reachable from the ancestor layouts: the
 * `[orgKey]` layout has the Organization and the `[version]` layout has the Version, whose
 * `service.name` is the spec's name rather than the application's.
 */
async function loadApplication(orgKey: string, appKey: string, sessionId: string | undefined) {
  const client = apiBuilderClient({ headers: getSessionHeaders(sessionId) });
  return handleApiCall<Application>(() => client.getApplicationByAppKey({ orgKey, appKey }));
}

export const load: PageServerLoad = async (event) => {
  const session = requireAuth(event);
  const response = await loadApplication(event.params.orgKey, event.params.appKey, session.id);

  return {
    application: isApiError(response) ? null : response.data,
    // Without this the visibility control renders a value nobody read, and submitting it would
    // write that guess back over whatever the application actually has.
    applicationLoadError: loadErrorFrom(response)
  };
};

export const actions: Actions = {
  updateVisibility: async ({ request, params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const client = apiBuilderClient({ headers });

    const visibility = requiredEnum(formData, 'visibility', Object.values(Visibility));
    if (!visibility) {
      return fail(400, { errors: [{ message: 'Visibility is required' }] });
    }

    // Re-read rather than trusting a hidden field: `updateApplicationByAppKey` takes a whole
    // `ApplicationForm`, so `name` and `description` are rewritten by every submission. Taking
    // them from the form would let a stale page rename the application, and taking `name` from
    // the spec would rename it to the service name on every visibility change.
    const current = await loadApplication(params.orgKey, params.appKey, session.id);
    if (isApiError(current)) {
      return actionFailMissing(current, 'Application not found');
    }

    // `description` is spread rather than set, because `exactOptionalPropertyTypes` makes an
    // explicit `undefined` a different thing from an absent key — and sending the key with no
    // value is what would clear a description this action has no business touching.
    const { name, description } = current.data;
    const response = await handleApiCall<Application>(() =>
      client.updateApplicationByAppKey({
        orgKey: params.orgKey,
        appKey: params.appKey,
        body: { name, visibility, ...(description === undefined ? {} : { description: description }) }
      })
    );

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(`/${params.orgKey}/${response.data.key}/${params.version}/settings`, 'Visibility updated');
  },

  deleteApp: async ({ params, locals }) => {
    const session = await requireAdminForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const client = apiBuilderClient({ headers });

    const response = await handleApiCall<void>(() => client.deleteApplicationByAppKey({ orgKey: params.orgKey, appKey: params.appKey }));

    if (isApiError(response)) {
      return actionFail(response);
    }

    redirectWithFlash(`/${params.orgKey}`, 'Application deleted');
  }
};
