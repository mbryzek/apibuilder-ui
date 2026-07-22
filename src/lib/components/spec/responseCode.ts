import type { Response } from '$generated/com-bryzek-apibuilder-spec';

/**
 * Formats an apibuilder response code for display.
 *
 * The backend serializes `code` as a bare JSON value — a number (e.g. `200`) for
 * status codes, or the string `"default"` — not as a wrapped `response_code` union.
 * We still accept the wrapped `{ integer: { value } }` / `{ response_code_option: { value } }`
 * form for forward compatibility. Falls back to `'???'` for anything unrecognized.
 */
export function getStatusCode(response: Response): string {
  const code = response.code;
  if (typeof code === 'number') {
    return String(code);
  }
  if (typeof code === 'string') {
    return code;
  }
  if (code?.integer) {
    return String(code.integer.value);
  }
  if (code?.response_code_option) {
    return code.response_code_option.value;
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
