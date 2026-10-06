import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createHmac, timingSafeEqual, scryptSync, randomBytes } from 'node:crypto';
import type { AdminRole } from '$lib/design-system/types.js';
import { db, isDbConfigured } from '$lib/server/db/index.js';
import { admins } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';

const COOKIE_NAME = 'ecofip_admin_session';

// Déconnexion automatique : après une période d'inactivité, et dans tous les cas après une
// durée maximale (même si l'utilisateur reste actif). Valeurs surchargeables par variables d'env.
const DEFAULT_IDLE_TIMEOUT_MINUTES = 30;
const DEFAULT_MAX_SESSION_HOURS = 12;

// Le cookie n'est réécrit qu'au plus une fois par minute, pour éviter un Set-Cookie à chaque requête
const ACTIVITY_REFRESH_INTERVAL_MS = 60 * 1000;
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

export interface AdminUser {
	id?: number;
	username: string;
	name: string;
	role: AdminRole;
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

/**
 * Hachage de mot de passe sécurisé basé sur scrypt (standard NIST / Node.js).
 */
export function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = scryptSync(password, salt, 64).toString('hex');
	return `scrypt:${salt}:${derivedKey}`;
}

/**
 * Vérification d'un mot de passe contre son hash stocké (avec support rétrocompatible).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
	if (!storedHash || !password) return false;

	if (storedHash.startsWith('scrypt:')) {
		const parts = storedHash.split(':');
		if (parts.length !== 3) return false;
		const [, salt, expectedKey] = parts;
		const candidateKey = scryptSync(password, salt, 64).toString('hex');
		return safeEqual(candidateKey, expectedKey);
	}

	// Fallback pour mots de passe bruts éventuels de seed/développement
	return safeEqual(password, storedHash);
}

/**
 * Authentifie un utilisateur soit via la base de données PostgreSQL Neon,
 * soit via les identifiants d'environnement de secours (Superadmin).
 */
export async function authenticateUser(
	username: string,
	password: string
): Promise<AdminUser | null> {
	const cleanUsername = username.trim().toLowerCase();
	if (!cleanUsername || !password) return null;

	// 1. Recherche dans la base de données Neon
	if (isDbConfigured && db) {
		try {
			const rows = await db
				.select()
				.from(admins)
				.where(eq(sql`LOWER(${admins.username})`, cleanUsername))
				.limit(1);

			if (rows.length > 0) {
				const u = rows[0];
				if (verifyPassword(password, u.passwordHash)) {
					return {
						id: u.id,
						username: u.username,
						name: u.name || 'Administrateur ECOFIP',
						role: (u.role as AdminRole) || 'admin'
					};
				}
			}
		} catch (err) {
			console.error('Erreur authentification DB:', err);
		}
	}

	// 2. Vérification du Superadmin d'environnement (.env)
	if (isAdminAuthConfigured()) {
		const envUsername = env.ADMIN_USERNAME!.trim().toLowerCase();
		if (safeEqual(cleanUsername, envUsername) && safeEqual(password, env.ADMIN_PASSWORD!)) {
			return {
				id: 0,
				username: cleanUsername,
				name: 'Super Administrateur ECOFIP',
				role: 'superadmin'
			};
		}
	}

	return null;
}

/**
 * Fonction historique pour compatibilité ascendante.
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
	if (!isAdminAuthConfigured()) return false;

	return (
		safeEqual(username.trim().toLowerCase(), env.ADMIN_USERNAME!.trim().toLowerCase()) &&
		safeEqual(password, env.ADMIN_PASSWORD!)
	);
}

function readPositiveNumber(value: string | undefined, fallback: number): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getSessionTimeouts(): { idleMs: number; maxAgeMs: number } {
	return {
		idleMs:
			readPositiveNumber(env.ADMIN_SESSION_IDLE_MINUTES, DEFAULT_IDLE_TIMEOUT_MINUTES) * 60_000,
		maxAgeMs: readPositiveNumber(env.ADMIN_SESSION_MAX_HOURS, DEFAULT_MAX_SESSION_HOURS) * 3_600_000
	};
}

export interface ActiveAdminSession {
	user: AdminUser;
	createdAt: number;
	lastActivityAt: number;
}

export type AdminSessionState =
	{ status: 'none' } | { status: 'expired' } | ({ status: 'active' } & ActiveAdminSession);

function writeSessionCookie(cookies: Cookies, session: ActiveAdminSession): void {
	const sessionPayload = JSON.stringify({
		id: session.user.id,
		username: session.user.username,
		name: session.user.name,
		role: session.user.role,
		createdAt: session.createdAt,
		lastActivityAt: session.lastActivityAt
	});
	const encodedPayload = Buffer.from(sessionPayload).toString('base64url');
	const sessionValue = `${encodedPayload}.${signSession(encodedPayload)}`;

	cookies.set(COOKIE_NAME, sessionValue, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		// Le cookie survit jusqu'à la durée maximale : c'est le serveur qui applique l'inactivité,
		// ce qui permet de distinguer une session expirée d'une absence de session.
		maxAge: Math.ceil(getSessionTimeouts().maxAgeMs / 1000)
	});
}

/**
 * Crée une session administrateur sécurisée dans les cookies HTTP.
 */
export function createAdminSession(cookies: Cookies, user: AdminUser): void {
	const now = Date.now();
	writeSessionCookie(cookies, { user, createdAt: now, lastActivityAt: now });
}

/**
 * Instant (ms) où la session expire : fin de la période d'inactivité ou durée maximale atteinte.
 */
export function getSessionExpiresAt(session: ActiveAdminSession): number {
	const { idleMs, maxAgeMs } = getSessionTimeouts();
	return Math.min(session.lastActivityAt + idleMs, session.createdAt + maxAgeMs);
}

/**
 * Indique si une nouvelle activité peut encore repousser l'expiration
 * (faux quand la durée maximale de session est la limite).
 */
export function canExtendSession(session: ActiveAdminSession, now = Date.now()): boolean {
	const { idleMs, maxAgeMs } = getSessionTimeouts();
	return now + idleMs < session.createdAt + maxAgeMs;
}

/**
 * Enregistre une activité de l'utilisateur : repousse l'expiration pour inactivité.
 */
export function touchAdminSession(
	cookies: Cookies,
	session: ActiveAdminSession
): ActiveAdminSession {
	const now = Date.now();
	const refreshIntervalMs = Math.min(
		ACTIVITY_REFRESH_INTERVAL_MS,
		getSessionTimeouts().idleMs / 10
	);
	if (now - session.lastActivityAt < refreshIntervalMs) return session;

	const refreshed = { ...session, lastActivityAt: now };
	writeSessionCookie(cookies, refreshed);
	return refreshed;
}

/**
 * Détruit la session administrateur (déconnexion).
 */
export function destroyAdminSession(cookies: Cookies): void {
	cookies.delete(COOKIE_NAME, { path: '/' });
}

/**
 * Lit la session administrateur depuis les cookies et applique les délais d'expiration.
 * Un cookie absent, falsifié ou illisible vaut « none » ; un cookie valide mais trop ancien
 * ou inactif depuis trop longtemps vaut « expired ».
 */
export function readAdminSession(cookies: Cookies): AdminSessionState {
	const sessionCookie = cookies.get(COOKIE_NAME);
	if (!sessionCookie) return { status: 'none' };

	try {
		const [encodedPayload, signature, extra] = sessionCookie.split('.');
		if (!encodedPayload || !signature || extra !== undefined) return { status: 'none' };
		if (!safeEqual(signature, signSession(encodedPayload))) return { status: 'none' };

		const data = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
		if (
			!data ||
			typeof data.username !== 'string' ||
			data.username.length === 0 ||
			!Number.isFinite(data.createdAt)
		) {
			return { status: 'none' };
		}

		// Les cookies émis avant l'ajout du suivi d'activité n'ont pas lastActivityAt :
		// on retient alors la date de connexion.
		const lastActivityAt: number = Number.isFinite(data.lastActivityAt)
			? data.lastActivityAt
			: data.createdAt;
		const now = Date.now();
		// Date dans le futur = cookie incohérent. Petite tolérance pour l'écart d'horloge entre instances.
		if (
			data.createdAt > now + CLOCK_SKEW_TOLERANCE_MS ||
			lastActivityAt > now + CLOCK_SKEW_TOLERANCE_MS
		) {
			return { status: 'none' };
		}

		const session: ActiveAdminSession = {
			user: {
				id: typeof data.id === 'number' ? data.id : undefined,
				username: data.username,
				name: data.name || 'Administrateur ECOFIP',
				role: (data.role as AdminRole) || 'admin'
			},
			createdAt: data.createdAt,
			lastActivityAt
		};

		if (now >= getSessionExpiresAt(session)) return { status: 'expired' };
		return { status: 'active', ...session };
	} catch {
		// Cookie illisible (JSON ou base64 invalide) : traité comme une absence de session
		return { status: 'none' };
	}
}

/**
 * Récupère l'utilisateur actuellement authentifié depuis les cookies.
 */
export function getAdminSession(cookies: Cookies): AdminUser | null {
	const session = readAdminSession(cookies);
	return session.status === 'active' ? session.user : null;
}

/**
 * Vérifie si un rôle donné a l'autorisation d'accéder à un chemin d'administration.
 */
export function canAccessRoute(role: string | null | undefined, pathname: string): boolean {
	if (!role) return false;
	if (role === 'superadmin') return true;

	// Gestion de sa propre session (état, maintien, déconnexion) : ouvert à tous les rôles
	if (pathname === '/admin/session' || pathname.startsWith('/admin/logout')) return true;

	// Admin classique : tous les onglets SAUF base de données
	if (role === 'admin') {
		if (pathname.startsWith('/admin/database')) return false;
		return true;
	}

	// Gestionnaire des événements
	if (role === 'events_manager') {
		if (
			pathname === '/admin' ||
			pathname.startsWith('/admin/evenements') ||
			pathname.startsWith('/admin/logout')
		) {
			return true;
		}
		return false;
	}

	// Gestionnaire des articles
	if (role === 'articles_manager') {
		if (
			pathname === '/admin' ||
			pathname.startsWith('/admin/articles') ||
			pathname.startsWith('/admin/logout')
		) {
			return true;
		}
		return false;
	}

	// Gestionnaire des témoignages
	if (role === 'testimonials_manager') {
		if (
			pathname === '/admin' ||
			pathname.startsWith('/admin/temoignages') ||
			pathname.startsWith('/admin/logout')
		) {
			return true;
		}
		return false;
	}

	return false;
}

/**
 * Retourne les rôles assignables selon le rôle de l'opérateur créateur.
 */
export function getAssignableRoles(creatorRole: string | null | undefined): AdminRole[] {
	if (creatorRole === 'superadmin') {
		return ['superadmin', 'admin', 'events_manager', 'articles_manager', 'testimonials_manager'];
	}
	if (creatorRole === 'admin') {
		// "l'admin peut aussi creer des utilisateur inferieur ou egal à son role" -> admin, events, articles, testimonials
		return ['admin', 'events_manager', 'articles_manager', 'testimonials_manager'];
	}
	return [];
}
