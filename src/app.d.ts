export type Session = {
	id: string;
	user: import('$lib/server/api').TenantSessionUser;
};

declare global {
	namespace App {
		interface Locals {
			session?: Session | undefined;
		}
		interface PageData {
			session?: Session | undefined;
		}
	}
}

export {};
