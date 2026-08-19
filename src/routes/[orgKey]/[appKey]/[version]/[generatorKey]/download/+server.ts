import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import { dataOrThrow } from '$lib/api/load-error';
import type { Code } from '$generated/com-bryzek-apibuilder';
import { attachmentHeader } from '$lib/server/download';
import { assertSafePathParams } from '$lib/server/path-params';

export const GET: RequestHandler = async ({ params, locals }) => {
  assertSafePathParams(params);
  const headers = getSessionHeaders(locals.session?.id);

  const response = await handleApiCall<Code>(() =>
    apiBuilderClient({ headers }).getCode({
      orgKey: params.orgKey,
      appKey: params.appKey,
      version: params.version,
      generatorKey: params.generatorKey
    })
  );

  // Keep "the API did not answer" apart from "this generator produced nothing". Folding them
  // together told a user mid-outage that the generator emits no files, so they stopped retrying.
  const code = dataOrThrow(response, 'No generated files found');

  if (code.files.length === 0) {
    throw error(404, 'No generated files found');
  }

  const files = code.files;

  // For single file, return it directly
  if (files.length === 1) {
    const file = files[0]!;
    return new Response(file.contents, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': attachmentHeader(file.dir ? `${file.dir}/${file.name}` : file.name)
      }
    });
  }

  // For multiple files, concatenate with headers
  const parts: string[] = [];
  for (const file of files) {
    const path = file.dir ? `${file.dir}/${file.name}` : file.name;
    parts.push(`// ===== ${path} =====\n\n${file.contents}`);
  }

  const combined = parts.join('\n\n');
  return new Response(combined, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': attachmentHeader(`${params.appKey}-${params.generatorKey}.txt`)
    }
  });
};
