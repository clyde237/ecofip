import type {
	AdminTabPermission,
	TabPermissionDefinition
} from './types.js';

export const ADMIN_CONTENT_TABS: TabPermissionDefinition[] = [
	{
		id: 'videos',
		label: 'Vidéos & Temps forts',
		href: '/admin/videos',
		description: 'Vidéos de la page d’accueil et temps forts',
		badge: 'Homepage'
	},
	{
		id: 'predications',
		label: 'Prédications vidéo',
		href: '/admin/predications',
		description: 'Prédications verticales et enseignements vidéo'
	},
	{
		id: 'evenements',
		label: 'Événements & Projets',
		href: '/admin/evenements',
		description: 'Croisades, programmes, séminaires et gadgets'
	},
	{
		id: 'articles',
		label: 'Articles & Actualités',
		href: '/admin/articles',
		description: 'Articles de foi, comptes-rendus et actualités'
	},
	{
		id: 'temoignages',
		label: 'Témoignages',
		href: '/admin/temoignages',
		description: 'Validation et publication des témoignages des fidèles',
		badge: 'Validation'
	},
	{
		id: 'galerie',
		label: 'Galerie photos & vidéos',
		href: '/admin/galerie',
		description: 'Albums photos et médiathèque générale'
	},
	{
		id: 'equipe',
		label: 'Équipe dirigeante',
		href: '/admin/equipe',
		description: 'Membres du directoire, coordinateurs et serviteurs',
		badge: 'À propos'
	}
];

export const ALL_CONTENT_PERMISSION_IDS: AdminTabPermission[] = [
	'videos',
	'predications',
	'evenements',
	'articles',
	'temoignages',
	'galerie',
	'equipe'
];

/**
 * Calcule la liste des permissions effectives d'un utilisateur.
 */
export function getUserPermissions(
	user: { role?: string | null; permissions?: string[] | null } | string | null | undefined
): string[] {
	if (!user) return [];
	const role = typeof user === 'string' ? user : user.role;
	const userPermissions =
		typeof user === 'object' && Array.isArray(user?.permissions) ? user.permissions : [];

	if (role === 'superadmin') {
		return [
			'videos',
			'predications',
			'evenements',
			'articles',
			'temoignages',
			'galerie',
			'equipe',
			'utilisateurs',
			'database'
		];
	}

	if (role === 'admin') {
		return [
			'videos',
			'predications',
			'evenements',
			'articles',
			'temoignages',
			'galerie',
			'equipe',
			'utilisateurs'
		];
	}

	// Pour un gestionnaire personnalisé avec des permissions explicites
	if (userPermissions.length > 0) {
		return userPermissions;
	}

	// Rétrocompatibilité avec les rôles historiques uniques
	if (role === 'events_manager') return ['evenements'];
	if (role === 'articles_manager') return ['articles'];
	if (role === 'testimonials_manager') return ['temoignages'];

	return [];
}

/**
 * Vérifie si un utilisateur dispose d'une permission spécifique.
 */
export function hasPermission(
	user: { role?: string | null; permissions?: string[] | null } | string | null | undefined,
	permission: string
): boolean {
	const perms = getUserPermissions(user);
	return perms.includes(permission);
}
