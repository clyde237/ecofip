import { redirect, type Handle } from '@sveltejs/kit';
import { getAdminSession } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	const admin = getAdminSession(event.cookies);
	event.locals.admin = admin;

	const isProtectedAdminRoute =
		event.url.pathname.startsWith('/admin') && event.url.pathname !== '/admin/login';
	const isLoginPage = event.url.pathname === '/admin/login';

	if (isProtectedAdminRoute && !admin) {
		throw redirect(303, `/admin/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
	}

	if (isLoginPage && admin) {
		throw redirect(303, '/admin');
	}

	return resolve(event);
};
