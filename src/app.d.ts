export type Session = {
	id: string;
	user: import('$generated/types').User;
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
