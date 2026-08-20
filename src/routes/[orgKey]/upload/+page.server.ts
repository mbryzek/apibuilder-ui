import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { handleApiCall, isApiError } from '$lib/api/error-handler';
import { actionFail } from '$lib/api/action-error';
import { requireAuthLoad, memberClient } from '$lib/server/auth';
import { optionalString } from '$lib/server/form';
import type { Version, OriginalForm } from '$generated/com-bryzek-apibuilder';

export const load: PageServerLoad = requireAuthLoad;

export const actions: Actions = {
  /**
   * Membership is what this action requires, like every sibling `[orgKey]` write.
   *
   * Uploading creates or overwrites an application version under `params.orgKey`. The page's own
   * "+ Upload" link is gated on `data.isMember` (`[version]/+page.svelte`), and hiding a link is
   * not access control — a non-member can post the form directly, so the guard is here.
   */
  default: async ({ request, params, locals }) => {
    const { client } = await memberClient(locals, params.orgKey);
    const formData = await request.formData();

    const appKey = optionalString(formData, 'app_key');
    const specType = optionalString(formData, 'spec_type');

    // `formData.get` answers `File | string | null`, so a text field posted under this name is not
    // a file. Narrowing rather than casting is what makes the refusal below reachable: `.text()`
    // on a string is a 500 where "please select a file" is meant.
    const entry = formData.get('file');
    const file = typeof entry === 'string' ? null : entry;

    if (!file || file.size === 0) {
      return fail(400, { errors: [{ message: 'Please select a file to upload' }], appKey, specType });
    }

    const data = await file.text();
    if (!data.trim()) {
      return fail(400, { errors: [{ message: 'Uploaded file is empty' }], appKey, specType });
    }

    const originalForm = specType ? { data, type: specType } : { data };

    const targetAppKey = appKey || deriveAppKeyFromSpec(data);
    if (!targetAppKey) {
      return fail(400, {
        errors: [{ message: 'Please provide an application key or ensure your spec includes a name' }],
        appKey,
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
      return actionFail(response, { appKey, specType });
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
