import { ErrorsResponse } from '$generated/generated-error-errors-response';
import { VoidResponse } from '$generated/generated-error-void-response';
import { ApiException } from '$generated/generated-util';

export interface ApiErrorItem {
	message: string;
	field?: string;
}

export interface ApiResponseSuccess<T> {
	data: T;
	status: number;
}

export interface ApiResponseError {
	errors: ApiErrorItem[];
	status: number;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export function isApiError<T>(response: ApiResponse<T>): response is ApiResponseError {
	return 'errors' in response;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponseSuccess<T> {
	return 'data' in response;
}

export interface ApiCallOptions {
	onUnauthorized?: () => void;
}

export async function handleApiCall<T>(
	apiCall: () => Promise<T>,
	options?: ApiCallOptions,
): Promise<ApiResponse<T>> {
	try {
		const data = await apiCall();
		// The generated client returns parsed data directly without exposing the
		// HTTP status code, so we use 200 as the default for successful responses.
		return { status: 200, data };
	} catch (error) {
		// Handle ErrorsResponse (409 validation errors)
		if (error instanceof ErrorsResponse) {
			try {
				const apiErrors = await error.errors();
				const parsedErrors: ApiErrorItem[] = apiErrors.map((e) => ({
					message: e.message,
					...(e.code && { field: e.code }),
				}));
				return {
					status: error.response.status,
					errors: parsedErrors.length > 0 ? parsedErrors : [{ message: 'Validation error' }],
				};
			} catch {
				return {
					status: error.response.status,
					errors: [{ message: 'Validation error' }],
				};
			}
		}

		// Handle VoidResponse (204 is success, 401/404 are errors)
		if (error instanceof VoidResponse) {
			const status = error.response.status;
			if (status >= 200 && status < 300) {
				return { status, data: undefined as T };
			}
			if (status === 401) {
				options?.onUnauthorized?.();
				return { status: 401, errors: [{ message: 'Unauthorized' }] };
			}
			return { status, errors: [{ message: 'Not found' }] };
		}

		// Handle ApiException (other HTTP errors including 401, 500, etc.)
		if (error instanceof ApiException) {
			const status = error.response.status;
			if (status === 401) {
				options?.onUnauthorized?.();
				return { status: 401, errors: [{ message: 'Unauthorized' }] };
			}
			return { status, errors: [{ message: error.message }] };
		}

		// Network errors and other exceptions
		let message = 'Unable to connect to the server. Please check your internet connection and try again.';
		if (error instanceof Error) {
			const msg = error.message.toLowerCase();
			if (msg.includes('fetch failed') || msg.includes('failed to fetch')) {
				message = 'Unable to connect to the server. Please check your internet connection and try again.';
			} else if (msg.includes('timeout')) {
				message = 'Request timed out. Please try again.';
			} else {
				message = error.message;
			}
		}

		return { status: 0, errors: [{ message }] };
	}
}

export function getGeneralErrors(errors: ApiErrorItem[] | undefined): ApiErrorItem[] {
	return errors?.filter((e) => !e.field) ?? [];
}
