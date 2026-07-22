import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { apiBuilderClient, getSessionHeaders } from '$lib/api/clients';
import { handleApiCall } from '$lib/api/error-handler';
import type { Code } from '$generated/com-bryzek-apibuilder';

/**
 * Make a filename safe to embed inside a quoted Content-Disposition header value.
 * The dir/name come from the upstream generator output, so strip CR/LF and the quote
 * character that would otherwise break out of the `filename="..."` token, and collapse
 * any leftover control characters. Falls back to a generic name if nothing survives.
 */
function safeContentDispositionFilename(name: string): string {
  // eslint-disable-next-line no-control-regex
  const cleaned = name.replace(/[\r\n"\\]/g, '_').replace(/[\u0000-\u001f\u007f]/g, '');
  return cleaned.length > 0 ? cleaned : 'download.txt';
}

export const GET: RequestHandler = async ({ params, locals }) => {
  const headers = locals.session ? getSessionHeaders(locals.session.id) : {};

  const response = await handleApiCall<Code>(() =>
    apiBuilderClient().getCode({
      orgKey: params.orgKey,
      appKey: params.appKey,
      version: params.version,
      generatorKey: params.generatorKey,
      headers
    })
  );

  if (!('data' in response) || response.data.files.length === 0) {
    throw error(404, 'No generated files found');
  }

  const files = response.data.files;

  // For single file, return it directly
  if (files.length === 1) {
    const file = files[0]!;
    const filename = safeContentDispositionFilename(file.dir ? `${file.dir}/${file.name}` : file.name);
    return new Response(file.contents, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
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
  const combinedFilename = safeContentDispositionFilename(`${params.appKey}-${params.generatorKey}.txt`);
  return new Response(combined, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${combinedFilename}"`
    }
  });
};
