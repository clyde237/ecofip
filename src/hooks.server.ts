import { redirect, type Handle } from '@sveltejs/kit';
import {
	readAdminSession,
	destroyAdminSession,
	touchAdminSession,
	getSessionExpiresAt,
	canExtendSession,
	canAccessRoute
} from '$lib/server/auth.js';
import dns from 'node:dns';
import net from 'node:net';

try {
	dns.setDefaultResultOrder?.('ipv4first');
} catch {
	// Ignorer si non supporté
}

try {
	net.setDefaultAutoSelectFamily?.(false);
} catch {
	// Ignorer si non supporté
}

export const handle: Handle = async ({ event, resolve }) => {
	const session = readAdminSession(event.cookies);
	if (session.status === 'expired') {
		destroyAdminSession(event.cookies);
	}
	const admin = session.status === 'active' ? session.user : null;
	event.locals.admin = admin;
	event.locals.adminSession = null;

	const isProtectedAdminRoute =
		event.url.pathname.startsWith('/admin') && event.url.pathname !== '/admin/login';
	const isLoginPage = event.url.pathname === '/admin/login';

	if (isProtectedAdminRoute && !admin) {
		const expiredParam = session.status === 'expired' ? '&reason=expired' : '';
		throw redirect(
			303,
			`/admin/login?redirectTo=${encodeURIComponent(event.url.pathname)}${expiredParam}`
		);
	}

	if (isLoginPage && admin) {
		throw redirect(303, '/admin');
	}

	// Contrôle d'accès basé sur les rôles (RBAC) pour les routes protégées
	if (isProtectedAdminRoute && admin) {
		const isAuthorized = canAccessRoute(admin.role, event.url.pathname);
		if (!isAuthorized) {
			// Redirection vers le tableau de bord avec statut 303 si accès non autorisé
			throw redirect(303, '/admin');
		}
	}

	// Toute requête sur l'admin compte comme activité et repousse la déconnexion automatique,
	// sauf la simple consultation de l'état de session par le minuteur côté client.
	if (isProtectedAdminRoute && session.status === 'active') {
		const isSessionStatusCheck =
			event.url.pathname === '/admin/session' && event.request.method === 'GET';
		const current = isSessionStatusCheck ? session : touchAdminSession(event.cookies, session);
		event.locals.adminSession = {
			expiresAt: getSessionExpiresAt(current),
			canExtend: canExtendSession(current)
		};
	}

	return resolve(event);
};
