import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuth, requireMemberForAction } from '$lib/server/auth';
import { optionalString } from '$lib/server/form';
import type { Version, OriginalForm } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = async (event) => {
  requireAuth(event);
  return {};
};

export const actions: Actions = {
  /**
   * `requireMemberForAction` replaces the bare `requireAuthForAction` to match every sibling
   * `[orgKey]` write — `details`, `domains`, `members`, `membership-requests` and `settings` all
   * require admin, `subscriptions` and `deleteVersion` require membership, and this was the only
   * one that asked for nothing but a signed-in session. The page's own "+ Upload" link is already
   * gated on `data.isMember` (`[version]/+page.svelte`), so members-only is the intent the UI has
   * always expressed; the action simply never enforced it, and hiding a link is not access
   * control. Uploading creates or overwrites an application version under `params.orgKey`, which
   * is not something a non-member should be able to do by posting the form directly.
   */
  default: async ({ request, params, locals }) => {
    const session = await requireMemberForAction(locals, params.orgKey);
    const headers = getSessionHeaders(session.id);
    const formData = await request.formData();
    const client = apiBuilderClient({ headers });

    const appKey = optionalString(formData, 'app_key');
    const visibility = optionalString(formData, 'visibility') ?? 'organization';
    const specType = optionalString(formData, 'spec_type');

    // `formData.get` answers `File | string | null`, so a text field posted under this name is not
    // a file. Narrowing rather than casting is what makes the refusal below reachable: `.text()`
    // on a string is a 500 where "please select a file" is meant.
    const entry = formData.get('file');
    const file = typeof entry === 'string' ? null : entry;

    if (!file || file.size === 0) {
      return fail(400, { errors: [{ message: 'Please select a file to upload' }], appKey, visibility, specType });
    }

    const data = await file.text();
    if (!data.trim()) {
      return fail(400, { errors: [{ message: 'Uploaded file is empty' }], appKey, visibility, specType });
    }

    const originalForm = specType ? { data, type: specType } : { data };

    const targetAppKey = appKey || deriveAppKeyFromSpec(data);
    if (!targetAppKey) {
      return fail(400, {
        errors: [{ message: 'Please provide an application key or ensure your spec includes a name' }],
        appKey,
        visibility,
        specType
      });
    }

    const version = deriveVersionFromSpec(data) || '0.0.1';

    const response = await handleApiCall<Version>(() =>
      client.updateVersionByVersion({
        orgKey: params.orgKey,
        appKey: targetAppKey,
        version,
        body: { original_form: originalForm as OriginalForm }
      })
    );

    if (isApiError(response)) {
      return actionFail(response, { appKey, visibility, specType });
    }

    throw redirect(303, `/${params.orgKey}/${targetAppKey}/${response.data.version}`);
  }
};

function deriveAppKeyFromSpec(data: string): string | undefined {
  try {
    const parsed = JSON.parse(data) as { name?: string };
    if (parsed.name) {
      return parsed.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  } catch {
    // Not JSON, can't derive key
  }
  return undefined;
}

function deriveVersionFromSpec(data: string): string | undefined {
  try {
    const parsed = JSON.parse(data) as { version?: string };
    return parsed.version || undefined;
  } catch {
    return undefined;
  }
}
