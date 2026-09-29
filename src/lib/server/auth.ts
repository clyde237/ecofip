import type { Cookies } from '@sveltejs/kit';

const COOKIE_NAME = 'ecofip_admin_session';

export interface AdminUser {
	username: string;
	name: string;
	role: string;
}

/**
 * Vérifie les identifiants administrateur.
 * Identifiants par défaut demandés : admin / admin.
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
	const cleanUsername = username.trim().toLowerCase();
	const cleanPassword = password.trim();

	// Identifiants par défaut ECOFIP
	if (cleanUsername === 'admin' && cleanPassword === 'admin') {
		return true;
	}

	return false;
}

/**
 * Crée une session administrateur sécurisée dans les cookies HTTP.
 */
export function createAdminSession(cookies: Cookies, user: AdminUser): void {
	const sessionPayload = JSON.stringify({
		username: user.username,
		name: user.name,
		role: user.role,
		createdAt: Date.now()
	});

	cookies.set(COOKIE_NAME, Buffer.from(sessionPayload).toString('base64'), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7 // 7 jours
	});
}

/**
 * Détruit la session administrateur (déconnexion).
 */
export function destroyAdminSession(cookies: Cookies): void {
	cookies.delete(COOKIE_NAME, { path: '/' });
}

/**
 * Récupère l'utilisateur actuellement authentifié depuis les cookies.
 */
export function getAdminSession(cookies: Cookies): AdminUser | null {
	const sessionCookie = cookies.get(COOKIE_NAME);
	if (!sessionCookie) return null;

	try {
		const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
		const data = JSON.parse(decoded);

		if (data && data.username === 'admin') {
			return {
				username: data.username,
				name: data.name || 'Administrateur ECOFIP',
				role: data.role || 'admin'
			};
		}
	} catch {
		return null;
	}

	return null;
}
