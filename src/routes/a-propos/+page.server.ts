import { db, isDbConfigured } from '$lib/server/db/index.js';
import { teamMembers } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { formatMediaUrl } from '$lib/server/r2.js';
import type { PageServerLoad } from './$types.js';
import type { AboutTeamMember } from '$lib/design-system/types.js';

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const rows = await db
				.select()
				.from(teamMembers)
				.where(eq(teamMembers.isPublished, true))
				.orderBy(asc(teamMembers.displayOrder), asc(teamMembers.id));

			const members: AboutTeamMember[] = rows.map((m) => ({
				id: String(m.id),
				name: m.name,
				role: m.role,
				tag: m.tag || 'DIRECTION',
				description: m.description || '',
				image: formatMediaUrl(m.photoUrl) || '/team-member-direction.png',
				imageAlt: `${m.name} — ${m.role}`
			}));

			return { teamMembers: members };
		} catch (err) {
			console.error('Erreur chargement équipe sur la page À propos:', err);
		}
	}

	// null = base indisponible : la section affiche l'équipe par défaut
	return { teamMembers: null as AboutTeamMember[] | null };
};
