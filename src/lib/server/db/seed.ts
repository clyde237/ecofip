import 'dotenv/config';
import { db } from './index.js';
import { admins, testimonials, events, articles } from './schema.js';

async function seedData() {
	if (!db) {
		console.error('db not configured');
		process.exit(1);
	}

	console.log('Insertion des données initiales sur Neon PostgreSQL...');

	// 1. Admin par défaut
	await db
		.insert(admins)
		.values({
			username: 'admin',
			passwordHash: 'admin',
			name: 'Administrateur ECOFIP',
			role: 'admin'
		})
		.onConflictDoNothing();

	// 2. Témoignages
	await db.insert(testimonials).values([
		{
			authorName: 'Jean-Pierre Kamga',
			authorRole: 'Commerçant & Père de famille',
			authorCity: 'Douala',
			avatarUrl: '/avatar-jean-pierre.jpg',
			content:
				'Après des années d’échecs et de découragement, j’ai assisté à la grande croisade ECOFIP à Douala. Ma vie spirituelle et mes affaires ont été entièrement restaurées.',
			isApproved: false
		},
		{
			authorName: 'Sarah Mbarga',
			authorRole: 'Responsable de jeunesse',
			authorCity: 'Yaoundé',
			avatarUrl: '/avatar-sarah.jpg',
			content:
				'La formation des disciples m’a donné des repères bibliques solides et un zèle nouveau pour témoigner auprès de ma génération.',
			isApproved: false
		},
		{
			authorName: 'Marie Claire Ngono',
			authorRole: 'Enseignante',
			authorCity: 'Bafoussam',
			avatarUrl: '/avatar-marie.jpg',
			content:
				'Le soutien médical et spirituel apporté lors des missions communautaires a guéri non seulement mon corps, mais ravivé la foi de toute ma famille.',
			isApproved: true,
			approvedAt: new Date()
		}
	]);

	// 3. Événements
	await db.insert(events).values([
		{
			title: 'Grande Croisade d’Évangélisation',
			slug: 'croisade-evangelisation',
			category: 'Croisade',
			dateDay: '15',
			dateMonthYear: 'OCT 2026',
			time: '18h00 – 22h00',
			location: 'Yaoundé, Cameroun',
			description: 'Soirée de louange, délivrance et proclamation de la Parole de Dieu.',
			imageUrl: '/event-croisade.jpg',
			isPublished: true
		},
		{
			title: 'Séminaire de Formation de Disciples',
			slug: 'seminaire-formation',
			category: 'Séminaire',
			dateDay: '22',
			dateMonthYear: 'OCT 2026',
			time: '09h00 – 16h00',
			location: 'Centre de formation ECOFIP',
			description:
				'Approfondissement des fondements de la foi chrétienne et équipement pour le service.',
			imageUrl: '/event-seminaire.jpg',
			isPublished: true
		},
		{
			title: 'Camp Régional des Jeunes',
			slug: 'camp-jeunes',
			category: 'Camp Jeunes',
			dateDay: '05',
			dateMonthYear: 'NOV 2026',
			time: '3 jours',
			location: 'Mont Fébé, Yaoundé',
			description: 'Rassemblement de réveil spirituel pour la jeunesse chrétienne du Cameroun.',
			imageUrl: '/event-camp.jpg',
			isPublished: false
		}
	]);

	// 4. Articles
	await db.insert(articles).values([
		{
			title: 'Retour sur nos dernières actions missionnaires',
			slug: 'actions-missionnaires',
			category: 'Mission',
			excerpt:
				'Bilan complet de nos récentes croisades et actions d’évangélisation à travers le pays.',
			content:
				'Nos équipes sur le terrain ont parcouru plusieurs localités pour proclamer l’Évangile, distribuer des vivres et apporter des soins de première nécessité aux familles.',
			imageUrl: '/article-bible.jpg',
			readTime: '4 min',
			isPublished: true,
			publishedAt: new Date()
		},
		{
			title: 'Des vies restaurées par la puissance de Dieu',
			slug: 'vies-restaurees',
			category: 'Témoignage',
			excerpt:
				'Récits émouvants de délivrance et de relèvement spirituel au sein des rassemblements.',
			content:
				'Au cours de notre dernière campagne régionale, de nombreuses personnes ont témoigné d’une paix retrouvée, de guérisons physiques et d’un renouveau dans leur foi.',
			imageUrl: '/article-communaute.jpg',
			readTime: '3 min',
			isPublished: true,
			publishedAt: new Date()
		},
		{
			title: 'Porter l’Évangile jusque dans les localités',
			slug: 'porter-evangile',
			category: 'Évangélisation',
			excerpt:
				'La vision d’implantation et de formation de nouveaux disciples dans les zones reculées.',
			content:
				'ECOFIP poursuit son engagement de formation continue des responsables d’églises et de soutien spirituel auprès des jeunes générations.',
			imageUrl: '/article-evangelisation.jpg',
			readTime: '5 min',
			isPublished: true,
			publishedAt: new Date()
		}
	]);

	console.log('✅ Données initiales insérées avec succès dans Neon PostgreSQL !');
}

void seedData();
