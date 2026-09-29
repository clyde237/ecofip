import { fail, redirect } from '@sveltejs/kit';
import { createAdminSession, verifyAdminCredentials } from '$lib/server/auth.js';
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
		const password = String(formData.get('password') ?? '').trim();

		if (!username || !password) {
			return fail(400, {
				error: 'Veuillez saisir votre identifiant et votre mot de passe.',
				username
			});
		}

		const isValid = verifyAdminCredentials(username, password);

		if (!isValid) {
			return fail(401, {
				error: 'Identifiant ou mot de passe incorrect (par défaut : admin / admin).',
				username
			});
		}

		createAdminSession(cookies, {
			username: 'admin',
			name: 'Administrateur ECOFIP',
			role: 'admin'
		});

		const redirectTo = url.searchParams.get('redirectTo') || '/admin';
		throw redirect(303, redirectTo);
	}
};
