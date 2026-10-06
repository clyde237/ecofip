import { db, isDbConfigured } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { eq, or } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import type { DetailedEventItem } from '$lib/design-system/types.js';
import { formatMediaUrl } from '$lib/server/r2.js';
import { getEventTargetDate } from '$lib/utils/eventDate.js';

const fallbackEvents: DetailedEventItem[] = [
	{
		id: '1',
		slug: 'croisade-evangelisation',
		title: 'Grande Croisade Nationale d’Évangélisation, Foi & Guérison',
		category: 'croisade',
		categoryLabel: 'Croisade',
		dateDay: '15-18',
		dateMonth: 'OCT',
		dateYear: '2026',
		time: '18h00 – 22h00',
		location: 'Esplanade du Stade Ahmadou Ahidjo',
		city: 'Yaoundé',
		image: '/event-croisade.jpg',
		imageAlt: 'Croisade d’évangélisation ECOFIP Yaoundé',
		status: 'upcoming',
		description:
			'Quatre soirées de rassemblement massif pour proclamer la bonne nouvelle de Jésus-Christ avec miracles, guérisons et distribution de bibles. Des cliniques médicales gratuites seront tenues chaque matin de 09h00 à 15h00 pour la population locale.',
		speakers: ['Pasteur Valéry Tchamekwen', 'Équipe Pastorale ECOFIP', 'Médecins Volontaires'],
		isFree: true,
		isFeatured: true,
		startDate: new Date('2026-10-15T18:00:00')
	},
	{
		id: '2',
		slug: 'seminaire-formation',
		title: 'Séminaire National des Disciples : Fondements & Maturité',
		category: 'formation',
		categoryLabel: 'Séminaire',
		dateDay: '24-25',
		dateMonth: 'OCT',
		dateYear: '2026',
		time: '09h00 – 16h30',
		location: 'Centre Polyvalent de Bonabéri',
		city: 'Douala',
		image: '/event-seminaire.jpg',
		imageAlt: 'Séminaire biblique des disciples ECOFIP',
		status: 'upcoming',
		description:
			'Une formation intensive de deux jours axée sur la doctrine biblique saine, le caractère du serviteur et la pratique de l’évangélisation personnelle. Des ateliers interactifs et sessions de mentorat spirituel seront organisés.',
		speakers: ['Pasteur Valéry Tchamekwen', 'Enseignants Bibliques Invités'],
		isFree: true,
		isFeatured: false,
		startDate: new Date('2026-10-24T09:00:00')
	},
	{
		id: '3',
		slug: 'camp-jeunes',
		title: 'Camp Biblique de la Jeunesse : « Une Génération Consacrée »',
		category: 'jeunesse',
		categoryLabel: 'Camp Jeunesse',
		dateDay: '05-08',
		dateMonth: 'NOV',
		dateYear: '2026',
		time: '4 jours (Pension complète)',
		location: 'Centre de Retraite Mont Fébé',
		city: 'Yaoundé',
		image: '/event-camp.jpg',
		imageAlt: 'Rassemblement de jeunes chrétiens au Mont Fébé',
		status: 'upcoming',
		description:
			'Un temps de mise à part pour les collégiens, lycéens et étudiants : louange vivante, ateliers pratiques, études bibliques et communion fraternelle au sommet du Mont Fébé.',
		speakers: ['Coordination Jeunesse ECOFIP', 'Mentors chrétiens'],
		isFree: true,
		isFeatured: false,
		startDate: new Date('2026-11-05T08:00:00')
	}
];

export const load: PageServerLoad = async ({ params }) => {
	const rawSlug = params.slug.trim();
	const numericId = Number(rawSlug);

	let foundEvent: DetailedEventItem | null = null;

	if (isDbConfigured && db) {
		try {
			const conditions = [eq(events.slug, rawSlug)];
			if (!isNaN(numericId) && numericId > 0) {
				conditions.push(eq(events.id, numericId));
			}

			const rows = await db
				.select()
				.from(events)
				.where(or(...conditions))
				.limit(1);

			if (rows.length > 0) {
				const ev = rows[0];
				const monthYearParts = (ev.dateMonthYear || 'OCT 2026').split(' ');
				const dateMonth = monthYearParts[0] || 'OCT';
				const dateYear = monthYearParts[1] || '2026';

				const now = new Date();
				const target = getEventTargetDate(ev);
				const status = target < now ? 'past' : 'upcoming';

				const defaultImg =
					ev.category === 'Camp Jeunes'
						? '/event-camp.jpg'
						: ev.category === 'Séminaire'
							? '/event-seminaire.jpg'
							: '/event-croisade.jpg';

				foundEvent = {
					id: String(ev.id),
					slug: ev.slug,
					title: ev.title,
					category: ev.category.toLowerCase().replace(/[^a-z]/g, '') || 'croisade',
					categoryLabel: ev.category,
					dateDay: ev.dateDay || '15',
					dateMonth,
					dateYear,
					time: ev.time || '18h00',
					location: ev.location,
					city: ev.location.includes(',') ? ev.location.split(',')[1].trim() : 'Cameroun',
					image: formatMediaUrl(ev.imageUrl) || defaultImg,
					imageAlt: ev.title,
					status,
					description: ev.description || '',
					speakers: ev.speakers
						? ev.speakers
								.split(',')
								.map((s) => s.trim())
								.filter(Boolean)
						: ['Pasteur Valéry Tchamekwen', 'Équipe Pastorale ECOFIP'],
					program: ev.program || null,
					isFree: true,
					isFeatured: Boolean(ev.isFeatured),
					registrationEnabled: ev.registrationEnabled,
					startDate: ev.startDate,
					eventDate: ev.eventDate,
					targetDate: target
				};
			}
		} catch (err) {
			console.error('Erreur recherche événement par slug:', err);
		}
	}

	if (!foundEvent) {
		const fallback = fallbackEvents.find(
			(e) => e.slug === rawSlug || e.id === rawSlug || (e.slug && rawSlug.includes(e.slug))
		);
		if (fallback) {
			foundEvent = {
				...fallback,
				targetDate: getEventTargetDate(fallback)
			};
		}
	}

	if (!foundEvent) {
		throw error(404, `Événement introuvable (${rawSlug})`);
	}

	return {
		event: foundEvent
	};
};
