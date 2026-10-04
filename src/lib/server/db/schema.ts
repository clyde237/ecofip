import { boolean, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

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

// 2. Table des Témoignages (visiteurs -> validation par l'admin)
export const testimonials = pgTable('testimonials', {
	id: serial('id').primaryKey(),
	authorName: varchar('author_name', { length: 150 }).notNull(),
	authorRole: varchar('author_role', { length: 150 }),
	authorCity: varchar('author_city', { length: 100 }),
	avatarUrl: text('avatar_url'),
	content: text('content').notNull(),
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
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 4. Table des Articles & Actualités
export const articles = pgTable('articles', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	category: varchar('category', { length: 100 }).notNull(),
	excerpt: text('excerpt'),
	content: text('content').notNull(),
	imageUrl: text('image_url'),
	readTime: varchar('read_time', { length: 50 }),
	isPublished: boolean('is_published').default(false).notNull(),
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
	displayOrder: integer('display_order').default(0).notNull(),
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
