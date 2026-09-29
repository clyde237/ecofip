CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(150) DEFAULT 'Administrateur ECOFIP',
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "articles" (
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
--> statement-breakpoint
CREATE TABLE "events" (
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
--> statement-breakpoint
CREATE TABLE "testimonials" (
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
