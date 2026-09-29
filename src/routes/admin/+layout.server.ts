import { redirect } from '@sveltejs/kit';
import { isDbConfigured } from '$lib/server/db/index.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Si on n'est pas sur /admin/login et que l'utilisateur n'est pas connecté, rediriger
	if (url.pathname !== '/admin/login' && !locals.admin) {
		throw redirect(303, `/admin/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	return {
		admin: locals.admin,
		isDbConfigured
	};
};
