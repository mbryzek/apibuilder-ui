import type { ApiClient } from '$lib/api/clients';

export type Session = {
	id: string;
	user: import('$generated/types').User;
};

declare global {
	namespace App {
		interface Locals {
			session?: Session | undefined;
			apiClient: ApiClient;
		}
		interface PageData {
			session?: Session | undefined;
		}
	}
}

export {};
