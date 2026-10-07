import { db, isDbConfigured } from '$lib/server/db/index.js';
import { teamMembers } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import {
	isR2Configured,
	isR2PublicDomainConfigured,
	formatMediaUrl,
	getR2PublicUrl,
	deleteFromR2
} from '$lib/server/r2.js';

const DEFAULT_PHOTO_URL = '/team-member-direction.png';
const DEFAULT_TAG = 'DIRECTION';

// Limites alignées sur les colonnes de la table team_members
const MAX_NAME_LENGTH = 150;
const MAX_ROLE_LENGTH = 150;
const MAX_TAG_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 1000;

// Clés générées par /api/upload et /api/upload-url pour le dossier « team » :
// team/<uuid>-<nom de fichier assaini>. Toute autre clé est refusée, pour qu'un formulaire
// modifié ne puisse pas faire supprimer un autre fichier du bucket (vidéos, miniatures...).
const TEAM_PHOTO_KEY_PATTERN =
	/^team\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9._-]+$/;

const fallbackTeamMembers = [
	{
		id: 1,
		name: 'Pasteur Valéry TCHAMEKWEN',
		role: 'Fondateur & Coordinateur National',
		tag: 'FONDATEUR',
		description:
			'Vision, prédication et conduite du projet national « Cameroun pour Jésus » à travers les 10 régions.',
		photoUrl: '/team-member-direction.png',
		photoKey: null as string | null,
		isPublished: true,
		displayOrder: 1,
		createdAt: new Date('2026-01-10'),
		updatedAt: new Date('2026-01-10')
	},
	{
		id: 2,
		name: 'Missionnaire Archange FOKAM',
		role: 'Directeur des Missions',
		tag: 'MISSIONS',
		description:
			'Organisation tactique, déploiement des équipes régionales et logistique sur le terrain.',
		photoUrl: '/team-member-missions.png',
		photoKey: null as string | null,
		isPublished: true,
		displayOrder: 2,
		createdAt: new Date('2026-01-12'),
		updatedAt: new Date('2026-01-12')
	},
	{
		id: 3,
		name: 'Germaine AMONDE',
		role: 'Responsable Intercession',
		tag: 'INTERCESSION',
		description:
			'Couverture spirituelle, coordination des réseaux de prière et veillées missionnaires.',
		photoUrl: '/team-member-formation.png',
		photoKey: null as string | null,
		isPublished: true,
		displayOrder: 3,
		createdAt: new Date('2026-01-15'),
		updatedAt: new Date('2026-01-15')
	}
];

type MemberFields = {
	name: string;
	role: string;
	tag: string;
	description: string | null;
	displayOrder: number;
	isPublished: boolean;
};

/**
 * Lecture et validation des champs texte communs à la création et à la modification.
 */
function parseMemberFields(formData: FormData): { values: MemberFields } | { error: string } {
	const name = String(formData.get('name') ?? '').trim();
	const role = String(formData.get('role') ?? '').trim();
	const tag =
		String(formData.get('tag') ?? '')
			.trim()
			.toUpperCase() || DEFAULT_TAG;
	const description = String(formData.get('description') ?? '').trim();
	const rawOrder = Number(formData.get('displayOrder') ?? 0);
	const displayOrder = Number.isFinite(rawOrder) ? Math.max(0, Math.trunc(rawOrder)) : 0;
	const isPublished = formData.get('isPublished') === 'on';

	if (!name) return { error: 'Le nom complet du membre est obligatoire.' };
	if (!role) {
		return { error: 'La fonction / rôle du membre est obligatoire (ex: Directeur des Missions).' };
	}
	if (name.length > MAX_NAME_LENGTH) {
		return { error: `Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.` };
	}
	if (role.length > MAX_ROLE_LENGTH) {
		return { error: `La fonction ne doit pas dépasser ${MAX_ROLE_LENGTH} caractères.` };
	}
	if (tag.length > MAX_TAG_LENGTH) {
		return { error: `L’étiquette ne doit pas dépasser ${MAX_TAG_LENGTH} caractères.` };
	}
	if (description.length > MAX_DESCRIPTION_LENGTH) {
		return { error: `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères.` };
	}

	return {
		values: { name, role, tag, description: description || null, displayOrder, isPublished }
	};
}

/**
 * Détermine la photo à enregistrer. La photo est déjà sur R2 (envoyée par le navigateur via
 * /api/upload ou une URL pré-signée) : le serveur ne reçoit que sa clé, qu'il valide, et
 * reconstruit lui-même l'URL publique. Sans clé, seule une URL d'image saisie à la main est
 * acceptée (chemin du site ou lien https).
 */
function resolvePhoto(formData: FormData): { photoUrl: string | null; photoKey: string | null } {
	const postedKey = String(formData.get('photoKey') ?? '').trim();
	if (TEAM_PHOTO_KEY_PATTERN.test(postedKey)) {
		return { photoUrl: getR2PublicUrl(postedKey), photoKey: postedKey };
	}

	const postedUrl = String(formData.get('photoUrl') ?? '').trim();
	const isSitePath = postedUrl.startsWith('/') && !postedUrl.startsWith('//');
	const isHttpsUrl = /^https:\/\/[^\s]+$/i.test(postedUrl);
	return { photoUrl: isSitePath || isHttpsUrl ? postedUrl : null, photoKey: null };
}

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const items = await db
				.select()
				.from(teamMembers)
				.orderBy(asc(teamMembers.displayOrder), asc(teamMembers.id));

			return {
				members: items.map((m) => ({
					...m,
					photoUrl: formatMediaUrl(m.photoUrl) || DEFAULT_PHOTO_URL
				})),
				usingNeonDb: true,
				isR2Configured,
				isR2PublicDomainConfigured
			};
		} catch (err) {
			console.error('Erreur lecture table team_members:', err);
		}
	}

	return {
		members: fallbackTeamMembers,
		usingNeonDb: false,
		isR2Configured,
		isR2PublicDomainConfigured
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const parsed = parseMemberFields(formData);
		if ('error' in parsed) return fail(400, { error: parsed.error });
		const { values } = parsed;
		const photo = resolvePhoto(formData);

		if (!isDbConfigured || !db) {
			return {
				success: true,
				message: `Membre « ${values.name} » enregistré (mode démonstration local).`
			};
		}

		try {
			await db.insert(teamMembers).values({
				...values,
				photoUrl: photo.photoUrl || DEFAULT_PHOTO_URL,
				photoKey: photo.photoKey
			});
		} catch (err: unknown) {
			console.error('Erreur création membre équipe:', err);
			return fail(500, { error: 'Erreur lors de l’enregistrement du membre sur Neon.' });
		}

		return {
			success: true,
			message: `« ${values.name} » a été ajouté à l’équipe dirigeante avec succès !`
		};
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Identifiant du membre invalide.' });
		}

		const parsed = parseMemberFields(formData);
		if ('error' in parsed) return fail(400, { error: parsed.error });
		const { values } = parsed;
		const photo = resolvePhoto(formData);

		if (!isDbConfigured || !db) {
			return { success: true, message: 'Membre mis à jour (mode démonstration).' };
		}

		let previousPhotoKey: string | null = null;
		try {
			const [existing] = await db
				.select({ photoUrl: teamMembers.photoUrl, photoKey: teamMembers.photoKey })
				.from(teamMembers)
				.where(eq(teamMembers.id, id))
				.limit(1);

			if (!existing) return fail(404, { error: 'Membre introuvable.' });

			// Sans nouvelle photo valide, on conserve la photo actuelle
			const nextPhotoUrl = photo.photoUrl || existing.photoUrl || DEFAULT_PHOTO_URL;
			const nextPhotoKey = photo.photoUrl ? photo.photoKey : existing.photoKey;

			await db
				.update(teamMembers)
				.set({ ...values, photoUrl: nextPhotoUrl, photoKey: nextPhotoKey, updatedAt: new Date() })
				.where(eq(teamMembers.id, id));

			if (existing.photoKey && existing.photoKey !== nextPhotoKey) {
				previousPhotoKey = existing.photoKey;
			}
		} catch (err: unknown) {
			console.error(`Erreur modification membre équipe #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour du membre.' });
		}

		// L'ancienne photo n'est supprimée de R2 qu'une fois la base à jour
		if (previousPhotoKey) await deleteFromR2(previousPhotoKey);

		return {
			success: true,
			message: `Les informations de « ${values.name} » ont été mises à jour.`
		};
	},

	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Identifiant invalide.' });
		}

		if (!isDbConfigured || !db) {
			return { success: true, message: 'Visibilité mise à jour.' };
		}

		try {
			const [existing] = await db
				.select({ name: teamMembers.name, isPublished: teamMembers.isPublished })
				.from(teamMembers)
				.where(eq(teamMembers.id, id))
				.limit(1);

			if (!existing) return fail(404, { error: 'Membre introuvable.' });

			const nextPublished = !existing.isPublished;
			await db
				.update(teamMembers)
				.set({ isPublished: nextPublished, updatedAt: new Date() })
				.where(eq(teamMembers.id, id));

			return {
				success: true,
				message: nextPublished
					? `« ${existing.name} » est désormais visible sur la page À propos.`
					: `« ${existing.name} » a été masqué de la page À propos.`
			};
		} catch (err: unknown) {
			console.error(`Erreur visibilité membre équipe #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la visibilité.' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Identifiant invalide.' });
		}

		if (!isDbConfigured || !db) {
			return { success: true, message: 'Membre supprimé.' };
		}

		let deleted: { name: string; photoKey: string | null } | undefined;
		try {
			[deleted] = await db
				.delete(teamMembers)
				.where(eq(teamMembers.id, id))
				.returning({ name: teamMembers.name, photoKey: teamMembers.photoKey });
		} catch (err: unknown) {
			console.error(`Erreur suppression membre équipe #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la suppression du membre.' });
		}

		if (!deleted) return fail(404, { error: 'Membre introuvable.' });

		// La photo n'est retirée de R2 qu'une fois la ligne supprimée
		if (deleted.photoKey) await deleteFromR2(deleted.photoKey);

		return {
			success: true,
			message: `« ${deleted.name} » a été retiré de l’équipe dirigeante.`
		};
	}
};
