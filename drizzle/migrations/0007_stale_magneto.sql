CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."pilot_level" AS ENUM('basic', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."pilot_stage" AS ENUM('assess', 'route', 'convert');--> statement-breakpoint
CREATE TYPE "public"."regulation_doc_type" AS ENUM('regulation', 'guide', 'manual');--> statement-breakpoint
CREATE TABLE "academy_course" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"level" "pilot_level" DEFAULT 'basic' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"slug" varchar(80) NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"duration_min" integer,
	"video_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_assessment" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"frames" jsonb,
	"client_jitter_metric" real,
	"scores" jsonb,
	"feedback" jsonb,
	"overall" integer,
	"suggested_level" "pilot_level",
	"model" varchar(48),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_event" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text,
	"session_id" text,
	"type" varchar(48) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_message" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"role" varchar(12) NOT NULL,
	"content" text NOT NULL,
	"tool_calls" jsonb,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"name" text,
	"locale" varchar(2) DEFAULT 'de' NOT NULL,
	"country" varchar(2) DEFAULT 'DE' NOT NULL,
	"plz" varchar(5),
	"equipment" jsonb,
	"certificates" jsonb,
	"flight_hours" integer,
	"portfolio" jsonb,
	"level" "pilot_level",
	"level_score" integer DEFAULT 0 NOT NULL,
	"passport_level" integer DEFAULT 0 NOT NULL,
	"memory" text,
	"persona" varchar(16) DEFAULT 'academy' NOT NULL,
	"customer_record_id" text,
	"hubspot_contact_id" text,
	"consent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_session" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text,
	"stage" "pilot_stage" DEFAULT 'assess' NOT NULL,
	"persona" varchar(16) DEFAULT 'academy' NOT NULL,
	"locale" varchar(2) DEFAULT 'de' NOT NULL,
	"ip_hash" varchar(64),
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulation_chunk" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"section_ref" text,
	"content" text NOT NULL,
	"tokens" integer DEFAULT 0 NOT NULL,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE TABLE "regulation_document" (
	"id" text PRIMARY KEY NOT NULL,
	"country" varchar(2) NOT NULL,
	"authority" text NOT NULL,
	"language" varchar(2) DEFAULT 'de' NOT NULL,
	"doc_type" "regulation_doc_type" DEFAULT 'regulation' NOT NULL,
	"title" text NOT NULL,
	"source_url" text NOT NULL,
	"content_hash" varchar(64),
	"effective_date" timestamp,
	"last_crawled_at" timestamp,
	"status" varchar(16) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sample_brief" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"brief" jsonb NOT NULL,
	"submission_url" text,
	"reviewed_at" timestamp,
	"review_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultation" ADD COLUMN "kind" varchar(16) DEFAULT 'sales' NOT NULL;--> statement-breakpoint
ALTER TABLE "academy_lesson" ADD CONSTRAINT "academy_lesson_course_id_academy_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_assessment" ADD CONSTRAINT "pilot_assessment_profile_id_pilot_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."pilot_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_event" ADD CONSTRAINT "pilot_event_profile_id_pilot_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."pilot_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_message" ADD CONSTRAINT "pilot_message_session_id_pilot_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pilot_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_profile" ADD CONSTRAINT "pilot_profile_customer_record_id_customer_id_fk" FOREIGN KEY ("customer_record_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_session" ADD CONSTRAINT "pilot_session_profile_id_pilot_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."pilot_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulation_chunk" ADD CONSTRAINT "regulation_chunk_document_id_regulation_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."regulation_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_brief" ADD CONSTRAINT "sample_brief_profile_id_pilot_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."pilot_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academy_course_slug_idx" ON "academy_course" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "academy_lesson_course_idx" ON "academy_lesson" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_lesson_slug_idx" ON "academy_lesson" USING btree ("course_id","slug");--> statement-breakpoint
CREATE INDEX "pilot_event_type_idx" ON "pilot_event" USING btree ("type");--> statement-breakpoint
CREATE INDEX "pilot_event_created_idx" ON "pilot_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pilot_message_session_idx" ON "pilot_message" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "pilot_message_created_idx" ON "pilot_message" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pilot_profile_email_idx" ON "pilot_profile" USING btree ("email");--> statement-breakpoint
CREATE INDEX "pilot_profile_level_idx" ON "pilot_profile" USING btree ("level");--> statement-breakpoint
CREATE INDEX "pilot_session_profile_idx" ON "pilot_session" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "pilot_session_ip_idx" ON "pilot_session" USING btree ("ip_hash");--> statement-breakpoint
CREATE INDEX "regulation_chunk_doc_idx" ON "regulation_chunk" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "regulation_chunk_fts_idx" ON "regulation_chunk" USING gin (to_tsvector('german', "content"));--> statement-breakpoint
CREATE INDEX "regulation_chunk_embedding_idx" ON "regulation_chunk" USING hnsw ("embedding" vector_cosine_ops);
