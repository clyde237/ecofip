import { fail, redirect } from '@sveltejs/kit';
import { createAdminSession, isAdminAuthConfigured, authenticateUser } from '$lib/server/auth.js';
import { isDbConfigured } from '$lib/server/db/index.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.admin) {
		throw redirect(303, '/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const password = String(formData.get('password') ?? '');

		if (!isAdminAuthConfigured() && !isDbConfigured) {
			return fail(503, {
				error: 'La connexion administrateur n’est pas configurée sur ce déploiement.',
				username
			});
		}

		if (!username || !password) {
			return fail(400, {
				error: 'Veuillez saisir votre identifiant et votre mot de passe.',
				username
			});
		}

		const user = await authenticateUser(username, password);

		if (!user) {
			return fail(401, {
				error: 'Identifiant ou mot de passe incorrect.',
				username
			});
		}

		createAdminSession(cookies, user);

		const redirectTo = url.searchParams.get('redirectTo') || '/admin';
		throw redirect(303, redirectTo);
	}
};
