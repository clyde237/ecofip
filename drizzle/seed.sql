-- ==============================================================================
-- ECOFIP — Script SQL d'initialisation complet pour Neon PostgreSQL
-- ==============================================================================

-- 1. Table des Administrateurs
CREATE TABLE IF NOT EXISTS "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(150) DEFAULT 'Administrateur ECOFIP',
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);

-- 2. Table des Témoignages
CREATE TABLE IF NOT EXISTS "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_name" varchar(150) NOT NULL,
	"author_role" varchar(150),
	"author_city" varchar(100),
	"avatar_url" text,
	"content" text NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- 3. Table des Événements & Projets
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(100) DEFAULT 'Croisade' NOT NULL,
	"date_day" varchar(10),
	"date_month_year" varchar(30),
	"event_date" timestamp,
	"time" varchar(100),
	"location" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- 4. Table des Articles & Actualités
CREATE TABLE IF NOT EXISTS "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"image_url" text,
	"read_time" varchar(50),
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Index de performance pour les filtres et classements
CREATE INDEX IF NOT EXISTS "idx_testimonials_approved" ON "testimonials" ("is_approved");
CREATE INDEX IF NOT EXISTS "idx_testimonials_submitted" ON "testimonials" ("submitted_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_events_published" ON "events" ("is_published");
CREATE INDEX IF NOT EXISTS "idx_events_date" ON "events" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_articles_published" ON "articles" ("is_published");
CREATE INDEX IF NOT EXISTS "idx_articles_date" ON "articles" ("created_at" DESC);

-- ==============================================================================
-- DONNÉES INITIALES (SEED)
-- ==============================================================================

-- Administrateur par défaut (admin / admin)
INSERT INTO "admins" ("username", "password_hash", "name", "role")
VALUES ('admin', 'admin', 'Administrateur ECOFIP', 'admin')
ON CONFLICT ("username") DO NOTHING;

-- Témoignages initiaux
INSERT INTO "testimonials" ("author_name", "author_role", "author_city", "avatar_url", "content", "is_approved", "approved_at")
VALUES
	(
		'Jean-Pierre Kamga',
		'Commerçant & Père de famille',
		'Douala',
		'/avatar-jean-pierre.jpg',
		'Après des années d’échecs et de découragement, j’ai assisté à la grande croisade ECOFIP à Douala. Ma vie spirituelle et mes affaires ont été entièrement restaurées.',
		false,
		NULL
	),
	(
		'Sarah Mbarga',
		'Responsable de jeunesse',
		'Yaoundé',
		'/avatar-sarah.jpg',
		'La formation des disciples m’a donné des repères bibliques solides et un zèle nouveau pour témoigner auprès de ma génération.',
		false,
		NULL
	),
	(
		'Marie Claire Ngono',
		'Enseignante',
		'Bafoussam',
		'/avatar-marie.jpg',
		'Le soutien médical et spirituel apporté lors des missions communautaires a guéri non seulement mon corps, mais ravivé la foi de toute ma famille.',
		true,
		NOW()
	);

-- Événements initiaux
INSERT INTO "events" ("title", "slug", "category", "date_day", "date_month_year", "time", "location", "description", "image_url", "is_published")
VALUES
	(
		'Grande Croisade d’Évangélisation',
		'croisade-evangelisation',
		'Croisade',
		'15',
		'OCT 2026',
		'18h00 – 22h00',
		'Yaoundé, Cameroun',
		'Soirée de louange, délivrance et proclamation puissante de la Parole de Dieu.',
		'/event-croisade.jpg',
		true
	),
	(
		'Séminaire de Formation de Disciples',
		'seminaire-formation',
		'Séminaire',
		'22',
		'OCT 2026',
		'09h00 – 16h00',
		'Centre de formation ECOFIP',
		'Approfondissement des fondements de la foi chrétienne et équipement pour le service.',
		'/event-seminaire.jpg',
		true
	),
	(
		'Camp Régional des Jeunes',
		'camp-jeunes',
		'Camp Jeunes',
		'05',
		'NOV 2026',
		'3 jours',
		'Mont Fébé, Yaoundé',
		'Rassemblement de réveil spirituel pour la jeunesse chrétienne du Cameroun.',
		'/event-camp.jpg',
		false
	);

-- Articles initiaux
INSERT INTO "articles" ("title", "slug", "category", "excerpt", "content", "image_url", "read_time", "is_published", "published_at")
VALUES
	(
		'Retour sur nos dernières actions missionnaires',
		'actions-missionnaires',
		'Mission',
		'Bilan complet de nos récentes croisades et actions d’évangélisation à travers le pays.',
		'Nos équipes sur le terrain ont parcouru plusieurs localités pour proclamer l’Évangile, distribuer des vivres et apporter des soins de première nécessité aux familles.',
		'/article-bible.jpg',
		'4 min',
		true,
		NOW()
	),
	(
		'Des vies restaurées par la puissance de Dieu',
		'vies-restaurees',
		'Témoignage',
		'Récits émouvants de délivrance et de relèvement spirituel au sein des rassemblements.',
		'Au cours de notre dernière campagne régionale, de nombreuses personnes ont témoigné d’une paix retrouvée, de guérisons physiques et d’un renouveau dans leur foi.',
		'/article-communaute.jpg',
		'3 min',
		true,
		NOW()
	),
	(
		'Porter l’Évangile jusque dans les localités',
		'porter-evangile',
		'Évangélisation',
		'La vision d’implantation et de formation de nouveaux disciples dans les zones reculées.',
		'ECOFIP poursuit son engagement de formation continue des responsables d’églises et de soutien spirituel auprès des jeunes générations.',
		'/article-evangelisation.jpg',
		'5 min',
		true,
		NOW()
	);
