import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'ecofip_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export interface AdminUser {
	username: string;
	name: string;
	role: string;
}

export function isAdminAuthConfigured(): boolean {
	return Boolean(
		env.ADMIN_USERNAME && env.ADMIN_PASSWORD && env.ADMIN_SECRET && env.ADMIN_SECRET.length >= 32
	);
}

function safeEqual(actual: string, expected: string): boolean {
	const actualBuffer = Buffer.from(actual);
	const expectedBuffer = Buffer.from(expected);
	return (
		actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
	);
}

function signSession(payload: string): string {
	if (!env.ADMIN_SECRET || env.ADMIN_SECRET.length < 32) {
		throw new Error('ADMIN_SECRET must contain at least 32 characters.');
	}

	return createHmac('sha256', env.ADMIN_SECRET).update(payload).digest('base64url');
}

export function verifyAdminCredentials(username: string, password: string): boolean {
	if (!isAdminAuthConfigured()) return false;

	return (
		safeEqual(username.trim().toLowerCase(), env.ADMIN_USERNAME!.trim().toLowerCase()) &&
		safeEqual(password, env.ADMIN_PASSWORD!)
	);
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
	const encodedPayload = Buffer.from(sessionPayload).toString('base64url');
	const sessionValue = `${encodedPayload}.${signSession(encodedPayload)}`;

	cookies.set(COOKIE_NAME, sessionValue, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: SESSION_MAX_AGE
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
		const [encodedPayload, signature, extra] = sessionCookie.split('.');
		if (!encodedPayload || !signature || extra !== undefined) return null;
		if (!safeEqual(signature, signSession(encodedPayload))) return null;

		const decoded = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
		const data = JSON.parse(decoded);
		const age = Date.now() - data.createdAt;

		if (
			data &&
			data.username === env.ADMIN_USERNAME &&
			Number.isFinite(data.createdAt) &&
			age >= 0 &&
			age <= SESSION_MAX_AGE * 1000
		) {
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
