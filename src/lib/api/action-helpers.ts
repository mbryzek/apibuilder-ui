/**
 * Server Action Helper Utilities
 * Simplify API response handling in form actions
 */

import { fail, type ActionFailure } from '@sveltejs/kit';
import type { ApiResponse, ApiError } from './error-handler';

/**
 * Standard action failure data shape
 */
export interface ActionFailureData {
	errors: ApiError[];
	[key: string]: unknown;
}

/**
 * Handle API response in a form action with automatic error mapping
 * Reduces boilerplate for the common pattern of checking 'errors' in response
 */
export function handleActionResponse<T, R>(
	response: ApiResponse<T>,
	onSuccess: (data: T) => R,
	options?: {
		failureData?: Record<string, unknown>;
		failureStatus?: number;
		transformErrors?: (errors: ApiError[]) => ApiError[];
	}
): R | ActionFailure<ActionFailureData> {
	if ('errors' in response) {
		const errors = options?.transformErrors
			? options.transformErrors(response.errors)
			: response.errors;

		const status = options?.failureStatus ?? response.status ?? 400;
		const failureData: ActionFailureData = {
			errors,
			...(options?.failureData ?? {})
		};

		return fail(status, failureData);
	}

	return onSuccess(response.data);
}

/**
 * Handle API response with preserved form data on failure
 */
export function handleActionResponseWithFormData<T, R>(
	response: ApiResponse<T>,
	onSuccess: (data: T) => R,
	formFields: Record<string, unknown>
): R | ActionFailure<ActionFailureData> {
	return handleActionResponse(response, onSuccess, {
		failureData: formFields
	});
}

/**
 * Create a standardized validation error for form actions
 */
export function createValidationError(
	field: string,
	message: string,
	formFields?: Record<string, unknown>
): ActionFailure<ActionFailureData> {
	return fail(422, {
		errors: [{ field, message }],
		...(formFields ?? {})
	});
}

/**
 * Create multiple validation errors for form actions
 */
export function createValidationErrors(
	errors: Array<{ field?: string; message: string }>,
	formFields?: Record<string, unknown>
): ActionFailure<ActionFailureData> {
	return fail(422, {
		errors,
		...(formFields ?? {})
	});
}

/**
 * Get all errors that don't have a specific field
 */
export function getGeneralErrors(errors: ApiError[] | undefined): ApiError[] {
	return errors?.filter((e) => !e.field) ?? [];
}
