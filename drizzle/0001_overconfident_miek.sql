CREATE TABLE "gallery_albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"location" varchar(150),
	"year" integer,
	"cover_item_id" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_albums_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"album_id" integer NOT NULL,
	"type" varchar(10) DEFAULT 'photo' NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"image_url" text NOT NULL,
	"image_key" text,
	"video_url" text,
	"video_key" text,
	"duration" varchar(20),
	"is_published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sermons" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(220) NOT NULL,
	"title" varchar(200) NOT NULL,
	"preacher" varchar(150),
	"scripture" varchar(120),
	"series" varchar(100),
	"description" text,
	"preached_on" date,
	"video_url" text NOT NULL,
	"video_key" text,
	"poster_url" text,
	"poster_key" text,
	"duration" varchar(20),
	"full_video_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sermons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"role" varchar(150) NOT NULL,
	"tag" varchar(50),
	"description" text,
	"photo_url" text,
	"photo_key" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"duration" varchar(50) DEFAULT '03:00' NOT NULL,
	"location" varchar(255) DEFAULT 'Yaoundé, Cameroun' NOT NULL,
	"thumbnail_url" text,
	"video_url" text NOT NULL,
	"description" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "date_day" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "date_month_year" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "testimonials" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "permissions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "image_key" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "author_name" varchar(150);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "author_role" varchar(150);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_time" varchar(20);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_time" varchar(20);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_single_day" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_all_day" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "speakers" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "program" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "registration_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "merchandise" jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "merchandise_whatsapp" varchar(20);--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "type" varchar(10) DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "source" varchar(10) DEFAULT 'visitor' NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "avatar_key" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "video_key" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "poster_url" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "poster_key" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "duration" varchar(20);--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "contact_info" varchar(150);--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_album_id_gallery_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."gallery_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_slug_unique" UNIQUE("slug");