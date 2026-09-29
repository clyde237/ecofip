import type { AdminUser } from '$lib/server/auth.js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			admin: AdminUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
