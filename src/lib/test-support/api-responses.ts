import type { ApiError, ApiResponse, ApiResponseError } from '$lib/api/error-handler';

/** A call that succeeded, carrying `data`. */
export function ok<T>(data: T): ApiResponse<T> {
  return { status: 200, data };
}

/**
 * A call that failed. Each error is either its message on its own or a whole `ApiError`, because
 * a validation failure names the `field` as well and several of these tests assert on it.
 */
export function failed(status: number, ...errors: (string | ApiError)[]): ApiResponseError {
  return { status, errors: errors.map((e) => (typeof e === 'string' ? { message: e } : e)) };
}
