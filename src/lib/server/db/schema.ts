import {
	boolean,
	date,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

/** Gadget d'un événement tel qu'enregistré en base (images = clés R2) */
export type StoredMerchandiseItem = {
	id: string;
	name: string;
	/** Prix en FCFA */
	price: number;
	description: string | null;
	imageKeys: string[];
	available: boolean;
};

// 1. Table des Administrateurs
export const admins = pgTable('admins', {
	id: serial('id').primaryKey(),
	username: varchar('username', { length: 100 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	name: varchar('name', { length: 150 }).default('Administrateur ECOFIP'),
	role: varchar('role', { length: 50 }).default('admin').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 2. Table des Témoignages (écrits envoyés par les visiteurs et validés par l'admin,
//    ou créés par l'admin ; vidéos créées par l'admin, fichiers sur Cloudflare R2)
export const testimonials = pgTable('testimonials', {
	id: serial('id').primaryKey(),
	// « text » (témoignage écrit) ou « video »
	type: varchar('type', { length: 10 }).default('text').notNull(),
	// « visitor » (formulaire public) ou « admin » (créé depuis l'espace admin)
	source: varchar('source', { length: 10 }).default('visitor').notNull(),
	authorName: varchar('author_name', { length: 150 }).notNull(),
	authorRole: varchar('author_role', { length: 150 }),
	authorCity: varchar('author_city', { length: 100 }),
	avatarUrl: text('avatar_url'),
	avatarKey: text('avatar_key'),
	// Texte du témoignage écrit, ou résumé facultatif d'une vidéo
	content: text('content'),
	videoUrl: text('video_url'),
	videoKey: text('video_key'),
	posterUrl: text('poster_url'),
	posterKey: text('poster_key'),
	duration: varchar('duration', { length: 20 }),
	// Email ou téléphone laissé par le visiteur : visible seulement dans l'admin, jamais publié
	contactInfo: varchar('contact_info', { length: 150 }),
	// Publié sur le site (validé par l'admin)
	isApproved: boolean('is_approved').default(false).notNull(),
	submittedAt: timestamp('submitted_at').defaultNow().notNull(),
	approvedAt: timestamp('approved_at'),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 3. Table des Événements & Projets
export const events = pgTable('events', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	category: varchar('category', { length: 100 }).default('Croisade').notNull(),
	dateDay: varchar('date_day', { length: 50 }),
	dateMonthYear: varchar('date_month_year', { length: 50 }),
	eventDate: timestamp('event_date'),
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),
	startTime: varchar('start_time', { length: 20 }),
	endTime: varchar('end_time', { length: 20 }),
	isSingleDay: boolean('is_single_day').default(true).notNull(),
	isAllDay: boolean('is_all_day').default(false).notNull(),
	time: varchar('time', { length: 100 }),
	location: varchar('location', { length: 255 }).notNull(),
	description: text('description'),
	speakers: text('speakers'),
	program: text('program'),
	imageUrl: text('image_url'),
	isPublished: boolean('is_published').default(false).notNull(),
	isFeatured: boolean('is_featured').default(false).notNull(),
	// false = événement en accès libre : le bouton « Participer / S'inscrire » est masqué
	registrationEnabled: boolean('registration_enabled').default(true).notNull(),
	// Gadgets vendus pour soutenir l'œuvre (t-shirts, polos…), images sur R2 dans events/
	merchandise: jsonb('merchandise').$type<StoredMerchandiseItem[]>(),
	// Numéro WhatsApp (chiffres seuls, indicatif compris) qui reçoit les commandes de gadgets
	merchandiseWhatsapp: varchar('merchandise_whatsapp', { length: 20 }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 4. Table des Articles & Actualités (page /actualites/[slug], images sur Cloudflare R2)
export const articles = pgTable('articles', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	// Adresse publique, conservée si le titre change (liens partagés)
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	category: varchar('category', { length: 100 }).notNull(),
	excerpt: text('excerpt'),
	// Document de l'éditeur visuel (JSON nettoyé) ou, pour les premiers articles, texte au format
	// simple (## intertitres, listes, **gras**…) : voir src/lib/utils/articleContent.ts
	content: text('content').notNull(),
	imageUrl: text('image_url'),
	// Clé R2 de l'image de couverture, pour la supprimer avec l'article
	imageKey: text('image_key'),
	authorName: varchar('author_name', { length: 150 }),
	authorRole: varchar('author_role', { length: 150 }),
	// Calculé à l'enregistrement à partir de la longueur du texte
	readTime: varchar('read_time', { length: 50 }),
	// Article mis en avant en tête de la page Actualités (un seul à la fois)
	isFeatured: boolean('is_featured').default(false).notNull(),
	isPublished: boolean('is_published').default(false).notNull(),
	// Événement dont parle l'article (facultatif) : l'article apparaît aussi sur sa page
	eventId: integer('event_id').references(() => events.id, { onDelete: 'set null' }),
	publishedAt: timestamp('published_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 5. Table des Vidéos (Temps forts pour la homepage)
export const videos = pgTable('videos', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	duration: varchar('duration', { length: 50 }).default('03:00').notNull(),
	location: varchar('location', { length: 255 }).default('Yaoundé, Cameroun').notNull(),
	thumbnailUrl: text('thumbnail_url'),
	videoUrl: text('video_url').notNull(),
	description: text('description'),
	isPublished: boolean('is_published').default(true).notNull(),
	// Vidéo à la une : affichée en premier dans le lecteur de la homepage (une seule à la fois)
	isFeatured: boolean('is_featured').default(false).notNull(),
	displayOrder: integer('display_order').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 6. Table de l'Équipe dirigeante (page À propos)
export const teamMembers = pgTable('team_members', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 150 }).notNull(),
	// Fonction affichée sous le nom (ex: « Fondateur & Coordinateur National »)
	role: varchar('role', { length: 150 }).notNull(),
	// Étiquette courte du badge (ex: « FONDATEUR », « MISSIONS »)
	tag: varchar('tag', { length: 50 }),
	description: text('description'),
	photoUrl: text('photo_url'),
	// Clé de l'objet dans Cloudflare R2, pour supprimer la photo avec le membre
	photoKey: text('photo_key'),
	isPublished: boolean('is_published').default(true).notNull(),
	displayOrder: integer('display_order').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 7. Albums de la Galerie : chaque photo ou vidéo appartient à un album (page /galerie/[slug])
export const galleryAlbums = pgTable('gallery_albums', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 200 }).notNull(),
	// Adresse publique de l'album, conservée si le titre change (liens partagés)
	slug: varchar('slug', { length: 220 }).notNull().unique(),
	description: text('description'),
	// Catégorie affichée et utilisée comme filtre (ex: « Croisades », « Actions sociales »)
	category: varchar('category', { length: 100 }).notNull(),
	location: varchar('location', { length: 150 }),
	// Année de l'événement photographié (facultative ; la date exacte est rarement connue)
	year: integer('year'),
	// Média utilisé comme couverture ; à défaut, la première photo de l'album
	coverItemId: integer('cover_item_id'),
	isPublished: boolean('is_published').default(true).notNull(),
	displayOrder: integer('display_order').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 8. Médias de la Galerie (photos & vidéos, fichiers sur Cloudflare R2)
export const galleryItems = pgTable('gallery_items', {
	id: serial('id').primaryKey(),
	albumId: integer('album_id')
		.notNull()
		.references(() => galleryAlbums.id, { onDelete: 'cascade' }),
	// « photo » ou « video »
	type: varchar('type', { length: 10 }).default('photo').notNull(),
	title: varchar('title', { length: 200 }).notNull(),
	description: text('description'),
	// Photo, ou affiche de la vidéo
	imageUrl: text('image_url').notNull(),
	imageKey: text('image_key'),
	videoUrl: text('video_url'),
	videoKey: text('video_key'),
	duration: varchar('duration', { length: 20 }),
	isPublished: boolean('is_published').default(true).notNull(),
	displayOrder: integer('display_order').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 9. Prédications vidéo au format court vertical (page /predications, fichiers sur Cloudflare R2)
export const sermons = pgTable('sermons', {
	id: serial('id').primaryKey(),
	// Adresse publique, conservée si le titre change (liens partagés)
	slug: varchar('slug', { length: 220 }).notNull().unique(),
	title: varchar('title', { length: 200 }).notNull(),
	preacher: varchar('preacher', { length: 150 }),
	// Référence biblique (ex: « Marc 11:23 »)
	scripture: varchar('scripture', { length: 120 }),
	// Série ou thème, utilisé comme filtre (ex: « La foi »)
	series: varchar('series', { length: 100 }),
	description: text('description'),
	// Date de la prédication (facultative)
	preachedOn: date('preached_on'),
	videoUrl: text('video_url').notNull(),
	videoKey: text('video_key'),
	posterUrl: text('poster_url'),
	posterKey: text('poster_key'),
	duration: varchar('duration', { length: 20 }),
	// Lien YouTube de la prédication complète (normalisé en https://www.youtube.com/watch?v=…)
	fullVideoUrl: text('full_video_url'),
	isPublished: boolean('is_published').default(false).notNull(),
	publishedAt: timestamp('published_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Export des types inférés Drizzle
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

export type EventRecord = typeof events.$inferSelect;
export type NewEventRecord = typeof events.$inferInsert;

export type ArticleRecord = typeof articles.$inferSelect;
export type NewArticleRecord = typeof articles.$inferInsert;

export type VideoRecord = typeof videos.$inferSelect;
export type NewVideoRecord = typeof videos.$inferInsert;

export type TeamMemberRecord = typeof teamMembers.$inferSelect;
export type NewTeamMemberRecord = typeof teamMembers.$inferInsert;

export type GalleryAlbumRecord = typeof galleryAlbums.$inferSelect;
export type NewGalleryAlbumRecord = typeof galleryAlbums.$inferInsert;

export type GalleryItemRecord = typeof galleryItems.$inferSelect;
export type NewGalleryItemRecord = typeof galleryItems.$inferInsert;

export type SermonRecord = typeof sermons.$inferSelect;
export type NewSermonRecord = typeof sermons.$inferInsert;
