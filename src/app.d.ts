import type { AdminUser } from '$lib/server/auth.js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			admin: AdminUser | null;
			/** Échéances de la session admin, renseignées par le hook sur les routes /admin protégées */
			adminSession: { expiresAt: number; canExtend: boolean } | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
