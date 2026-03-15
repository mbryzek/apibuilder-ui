/**
 * API Error Handling Utilities
 * Convert generated API client exceptions to consistent response format
 */

import { ValidationErrorsResponse } from "$generated/generated-error-validation-errors-response";
import { UnauthorizedErrorsResponse } from "$generated/generated-error-unauthorized-errors-response";
import { VoidResponse } from "$generated/generated-error-void-response";
import { ApiException } from "$generated/generated-util";
import type { ValidationError } from "$generated/com-bryzek-platform-error-v0";

// ============================================================================
// Response Types
// ============================================================================

/**
 * API error with optional field reference
 */
export interface ApiError {
	message: string;
	field?: string;
}

/**
 * Alias for backward compatibility with .svelte files
 */
export type ApiErrorItem = ApiError;

/**
 * Successful API response with data
 */
export interface ApiResponseSuccess<T> {
	data: T;
	status: number;
}

/**
 * Error API response with errors
 */
export interface ApiResponseError {
	errors: ApiError[];
	status: number;
}

/**
 * Standard API response wrapper - discriminated union
 */
export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

/**
 * Type guard to check if response is an error
 */
export function isApiError<T>(
	response: ApiResponse<T>
): response is ApiResponseError {
	return 'errors' in response;
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(
	response: ApiResponse<T>
): response is ApiResponseSuccess<T> {
	return 'data' in response;
}

/**
 * Options for API call handling
 */
export interface ApiCallOptions {
	onUnauthorized?: () => void;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Execute an API call and convert exceptions to ApiResponse format.
 * Works with generated API clients that throw typed exceptions.
 */
export async function handleApiCall<T>(
	apiCall: () => Promise<T>,
	options?: ApiCallOptions,
): Promise<ApiResponse<T>> {
	try {
		const data = await apiCall();
		return { status: 200, data };
	} catch (error) {
		if (error instanceof ValidationErrorsResponse) {
			const validationErrors = await error.validationErrors();
			return {
				status: error.response.status,
				errors: parseValidationErrors(validationErrors),
			};
		}

		if (error instanceof UnauthorizedErrorsResponse) {
			if (options?.onUnauthorized) {
				options.onUnauthorized();
			}
			const unauthorizedErrors = await error.unauthorizedErrors();
			const errors = unauthorizedErrors
				.map((e) => e.message)
				.filter(Boolean)
				.map((message) => ({ message }));
			return {
				status: error.response.status,
				errors: errors.length > 0 ? errors : [{ message: "Unauthorized" }],
			};
		}

		if (error instanceof VoidResponse) {
			const status = error.response.status;
			const isSuccess = status >= 200 && status < 300;

			if (isSuccess) {
				return {
					status,
					data: undefined as T,
				};
			}
			return {
				status,
				errors: [{ message: "Not found" }],
			};
		}

		if (error instanceof ApiException) {
			return {
				status: error.response.status,
				errors: [{ message: error.message }],
			};
		}

		let errorMessage =
			"Unable to connect to the server. Please check your internet connection and try again.";

		if (error instanceof Error) {
			const msg = error.message.toLowerCase();
			if (msg.includes("fetch failed") || msg.includes("failed to fetch")) {
				errorMessage =
					"Unable to connect to the server. Please check your internet connection and try again.";
			} else if (msg.includes("network")) {
				errorMessage =
					"Network error occurred. Please check your internet connection and try again.";
			} else if (msg.includes("timeout")) {
				errorMessage = "Request timed out. Please try again.";
			} else {
				errorMessage = error.message;
			}
		}

		return {
			status: 0,
			errors: [{ message: errorMessage }],
		};
	}
}

/**
 * Parse ValidationError[] into ApiError[]
 */
function parseValidationErrors(errors: ValidationError[]): ApiError[] {
	return errors.map((err) => ({
		message: err.message,
		...(err.field && { field: err.field }),
	}));
}

/**
 * Get all errors that don't have a specific field
 */
export function getGeneralErrors(errors: ApiError[] | undefined): ApiError[] {
	return errors?.filter((e) => !e.field) ?? [];
}
