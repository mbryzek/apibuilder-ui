import type { User } from '$generated/com-bryzek-platform';

export type Session = {
	id: string;
	user: User;
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
