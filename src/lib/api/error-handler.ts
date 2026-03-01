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

interface ApiCallOptions {
	onUnauthorized?: () => void;
}

export async function handleApiCall<T>(
	apiCall: () => Promise<globalThis.Response>,
	options?: ApiCallOptions,
): Promise<ApiResponse<T>> {
	try {
		const response = await apiCall();

		if (response.ok) {
			if (response.status === 204) {
				return { status: 204, data: undefined as T };
			}
			const data = (await response.json()) as T;
			return { status: response.status, data };
		}

		if (response.status === 401) {
			options?.onUnauthorized?.();
			let errors: ApiErrorItem[];
			try {
				const body = (await response.json()) as { message?: string }[];
				errors = Array.isArray(body)
					? body.map((e) => ({ message: e.message ?? 'Unauthorized' }))
					: [{ message: 'Unauthorized' }];
			} catch {
				errors = [{ message: 'Unauthorized' }];
			}
			return { status: 401, errors };
		}

		if (response.status === 404) {
			return { status: 404, errors: [{ message: 'Not found' }] };
		}

		if (response.status === 409 || response.status === 422) {
			try {
				const body = (await response.json()) as { code?: string; message: string }[];
				const errors: ApiErrorItem[] = Array.isArray(body)
					? body.map((e) => {
							const item: ApiErrorItem = { message: e.message };
							if (e.code) {
								item.field = e.code;
							}
							return item;
						})
					: [{ message: 'Validation error' }];
				return { status: response.status, errors };
			} catch {
				return { status: response.status, errors: [{ message: 'Validation error' }] };
			}
		}

		return {
			status: response.status,
			errors: [{ message: `Request failed with status ${String(response.status)}` }],
		};
	} catch (error: unknown) {
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
