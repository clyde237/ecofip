/**
 * Données officielles du programme « Cameroun Pour Jésus » (CPJ) et de sa croisade de clôture,
 * reprises du pressbook « Bafoussam pour Jésus » et de la présentation « Vision CPJ » (2026).
 * Source unique pour l'accueil, la page Projets & Missions, la carte et le référencement :
 * mettre à jour ici quand de nouveaux chiffres sont publiés.
 */

export const ORGANIZATION = {
	name: 'ECOFIP',
	legalName: 'Les Économes Fidèles et Prudents',
	description:
		'Département d’évangélisation de l’Association Go International Ministry, ECOFIP porte le programme « Cameroun Pour Jésus » : campagnes d’évangélisation, de guérison et d’actions sociales dans les 10 régions du Cameroun.',
	parentOrganization: 'Go International Ministry',
	founder: 'Pasteur Valéry Tchamekwen',
	country: 'Cameroun'
} as const;

export const PROGRAM = {
	name: 'Cameroun Pour Jésus',
	startYear: 2024,
	summary:
		'Une série de campagnes d’évangélisation, de guérison et d’actions sociales qui se déroule dans les 10 régions du Cameroun depuis 2024. En trois ans, 9 des 10 régions ont été parcourues, proclamant l’Évangile appuyé de signes et de prodiges et guérissant les malades.',
	pillars: ['Évangélisation', 'Guérison', 'Action sociale']
} as const;

/** L'impact en chiffres (pressbook 2026) */
export const IMPACT = {
	regionsVisited: 9,
	regionsTotal: 10,
	campaigns: 20,
	cities: 19,
	kilometers: 30_000,
	peopleReached: 20_000,
	healings: 250,
	deliverances: 200,
	peopleCounselled: 600,
	literatureDistributed: 300,
	healthCampaign: { campaigns: 1, caregivers: 15, patients: 150 }
} as const;

export const TIMELINE = [
	{
		year: 2024,
		title: 'Le départ',
		description: 'Les premières campagnes et les premières vies touchées.'
	},
	{
		year: 2025,
		title: 'L’expansion',
		description: 'La vision s’étend à davantage de villes et de régions.'
	},
	{
		year: 2026,
		title: 'La clôture',
		description: 'La dernière étape à Bafoussam pour clôturer ce mandat de foi.'
	}
] as const;

export type Edition = {
	city: string;
	region: string;
	dates: string;
	/** Premier jour de la campagne, pour le tri et les données structurées */
	startDate: string;
	peopleReached: number;
	testimonies: number;
};

/** Les éditions précédentes en chiffres (témoignages de guérisons ou de délivrances) */
export const EDITIONS: Edition[] = [
	{
		city: 'Kribi',
		region: 'Sud',
		dates: '13-16 mars 2024',
		startDate: '2024-03-13',
		peopleReached: 750,
		testimonies: 20
	},
	{
		city: 'Édéa',
		region: 'Littoral',
		dates: '18-21 mars 2024',
		startDate: '2024-03-18',
		peopleReached: 1000,
		testimonies: 30
	},
	{
		city: 'Touboro',
		region: 'Nord',
		dates: '7-10 mai 2024',
		startDate: '2024-05-07',
		peopleReached: 2500,
		testimonies: 100
	},
	{
		city: 'Ngaoundéré',
		region: 'Adamaoua',
		dates: '12-15 mai 2024',
		startDate: '2024-05-12',
		peopleReached: 400,
		testimonies: 15
	},
	{
		city: 'Dimako',
		region: 'Est',
		dates: '8-10 août 2024',
		startDate: '2024-08-08',
		peopleReached: 300,
		testimonies: 10
	},
	{
		city: 'Obala',
		region: 'Centre',
		dates: '12-15 août 2024',
		startDate: '2024-08-12',
		peopleReached: 1500,
		testimonies: 30
	},
	{
		city: 'Tombel',
		region: 'Sud-Ouest',
		dates: '6-9 octobre 2024',
		startDate: '2024-10-06',
		peopleReached: 150,
		testimonies: 3
	},
	{
		city: 'Maroua',
		region: 'Extrême-Nord',
		dates: '13-15 mars 2025',
		startDate: '2025-03-13',
		peopleReached: 4000,
		testimonies: 115
	},
	{
		city: 'Guider',
		region: 'Nord',
		dates: '17-19 mars 2025',
		startDate: '2025-03-17',
		peopleReached: 6000,
		testimonies: 80
	},
	{
		city: 'Abong-Mbang',
		region: 'Est',
		dates: '24-26 avril 2025',
		startDate: '2025-04-24',
		peopleReached: 500,
		testimonies: 25
	},
	{
		city: 'Ayos',
		region: 'Centre',
		dates: '28-30 avril 2025',
		startDate: '2025-04-28',
		peopleReached: 300,
		testimonies: 15
	},
	{
		city: 'Tombel',
		region: 'Sud-Ouest',
		dates: '29-31 mai 2025',
		startDate: '2025-05-29',
		peopleReached: 300,
		testimonies: 15
	},
	{
		city: 'Dibombari',
		region: 'Littoral',
		dates: '2-4 juin 2025',
		startDate: '2025-06-02',
		peopleReached: 400,
		testimonies: 9
	},
	{
		city: 'Ébolowa',
		region: 'Sud',
		dates: '26-28 juin 2025',
		startDate: '2025-06-26',
		peopleReached: 200,
		testimonies: 10
	},
	{
		city: 'Magba',
		region: 'Ouest',
		dates: '7-9 août 2025',
		startDate: '2025-08-07',
		peopleReached: 500,
		testimonies: 50
	},
	{
		city: 'Mokolo',
		region: 'Extrême-Nord',
		dates: '5-7 mars 2026',
		startDate: '2026-03-05',
		peopleReached: 2000,
		testimonies: 60
	},
	{
		city: 'Figuil',
		region: 'Nord',
		dates: '9-11 mars 2026',
		startDate: '2026-03-09',
		peopleReached: 1000,
		testimonies: 50
	},
	{
		city: 'Meiganga',
		region: 'Adamaoua',
		dates: '13-15 mars 2026',
		startDate: '2026-03-13',
		peopleReached: 500,
		testimonies: 40
	},
	{
		city: 'Batouri',
		region: 'Est',
		dates: '14-16 mai 2026',
		startDate: '2026-05-14',
		peopleReached: 300,
		testimonies: 10
	},
	{
		city: 'Limbé',
		region: 'Sud-Ouest',
		dates: '18-21 juin 2026',
		startDate: '2026-06-18',
		peopleReached: 200,
		testimonies: 7
	}
];

/** Coordonnées [latitude, longitude] des villes, pour la carte des missions */
export const CITY_COORDINATES: Record<string, [number, number]> = {
	Bafoussam: [5.4781, 10.4176],
	Kribi: [2.9373, 9.9077],
	Édéa: [3.8, 10.1333],
	Touboro: [7.771, 15.357],
	Ngaoundéré: [7.3167, 13.5833],
	Dimako: [4.3833, 13.5667],
	Obala: [4.1667, 11.5333],
	Tombel: [4.75, 9.6667],
	Maroua: [10.5956, 14.3247],
	Guider: [9.9333, 13.95],
	'Abong-Mbang': [3.9833, 13.1833],
	Ayos: [3.9, 12.5167],
	Dibombari: [4.1833, 9.65],
	Ébolowa: [2.9, 11.15],
	Magba: [5.9667, 11.2167],
	Mokolo: [10.74, 13.8],
	Figuil: [9.7583, 13.9667],
	Meiganga: [6.5167, 14.3],
	Batouri: [4.4333, 14.3667],
	Limbé: [4.0167, 9.2]
};

/** Croisade de clôture du programme */
export const FINAL_CRUSADE = {
	name: 'Bafoussam pour Jésus',
	tagline: 'La vision d’une ville qui se lève',
	city: 'Bafoussam',
	region: 'Ouest',
	dates: 'Du 27 au 30 octobre 2026',
	startDate: '2026-10-27',
	endDate: '2026-10-30',
	venue: 'Stade Omnisport Toket',
	partners: 'Les églises de la ville de Bafoussam',
	description:
		'Après presque trois ans de travail sur l’ensemble du territoire camerounais, les Économes Fidèles et Prudents déposent leur valise à Bafoussam pour la croisade « Bafoussam pour Jésus », qui marque la clôture du programme « Cameroun Pour Jésus ».'
} as const;

export const KEY_VERSES = [
	{
		reference: 'Luc 12:42',
		text: 'Et le Seigneur dit : Quel est donc l’économe fidèle et prudent que le maître établira sur ses gens, pour leur donner la nourriture au temps convenable ?'
	},
	{
		reference: 'Matthieu 9:35',
		text: 'Jésus parcourait toutes les villes et les villages, enseignant dans les synagogues, prêchant la bonne nouvelle du royaume, et guérissant toute maladie et toute infirmité.'
	}
] as const;

/** « 20 000 » → « 20 000 » avec espace insécable fine, à la française */
export function formatNumber(value: number): string {
	return value.toLocaleString('fr-FR');
}
