import type { Response } from '$generated/com-bryzek-apibuilder-spec';

/**
 * Formats an apibuilder response code for display.
 */
export function getStatusCode(response: Response): string {
  return String(response.code);
}

export function getStatusColorClass(code: string): string {
  if (code.startsWith('2')) return 'bg-green-100 text-green-800';
  if (code.startsWith('3')) return 'bg-blue-100 text-blue-800';
  if (code.startsWith('4')) return 'bg-yellow-100 text-yellow-800';
  if (code.startsWith('5')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}
