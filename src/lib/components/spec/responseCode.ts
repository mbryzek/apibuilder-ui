import type { Response } from '$generated/com-bryzek-apibuilder-spec';

/**
 * Formats an apibuilder response code for display.
 *
 * The apibuilder backend serializes `code` as the wrapped `response_code` union — either
 * `{ integer: { value } }` for an HTTP status code (e.g. 200, 409) or
 * `{ response_code_option: { value } }` for the string `"default"`. We also accept the
 * bare number / string form for forward compatibility (the generated type currently
 * declares `code: number`, which does not match the live wrapped serialization). Falls
 * back to `'???'` for anything unrecognized rather than rendering `[object Object]`.
 */
export function getStatusCode(response: Response): string {
  const code: unknown = response.code;
  if (typeof code === 'number') {
    return String(code);
  }
  if (typeof code === 'string') {
    return code;
  }
  if (code && typeof code === 'object') {
    const wrapped = code as {
      integer?: { value?: unknown };
      response_code_option?: { value?: unknown };
    };
    if (wrapped.integer && wrapped.integer.value != null) {
      return String(wrapped.integer.value);
    }
    if (wrapped.response_code_option && wrapped.response_code_option.value != null) {
      return String(wrapped.response_code_option.value);
    }
  }
  return '???';
}

export function getStatusColorClass(code: string): string {
  if (code.startsWith('2')) return 'bg-green-100 text-green-800';
  if (code.startsWith('3')) return 'bg-blue-100 text-blue-800';
  if (code.startsWith('4')) return 'bg-yellow-100 text-yellow-800';
  if (code.startsWith('5')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}
