CREATE TYPE "public"."comment_source" AS ENUM('internal', 'client');--> statement-breakpoint
CREATE TYPE "public"."customer_kind" AS ENUM('person', 'company');--> statement-breakpoint
CREATE TYPE "public"."deal_note_kind" AS ENUM('note', 'call', 'meeting', 'email', 'task');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'qualified', 'proposal', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('project_assignment', 'client_comment', 'share_approval', 'weather_warning', 'delivery_ready', 'status_change', 'asset_uploaded');--> statement-breakpoint
CREATE TYPE "public"."studio_status" AS ENUM('draft', 'production', 'client_approval', 'revision', 'approved', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'pending', 'suspended');--> statement-breakpoint
ALTER TYPE "public"."shot_asset_kind" ADD VALUE 'briefing' BEFORE 'raw';--> statement-breakpoint
ALTER TYPE "public"."shot_asset_kind" ADD VALUE 'other';--> statement-breakpoint
CREATE TABLE "company" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"legal_name" text,
	"website" text,
	"primary_email" text,
	"primary_phone" text,
	"billing_address" text,
	"notes" text,
	"archived_at" timestamp,
	"created_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"role_at_customer" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text,
	"kind" "customer_kind" DEFAULT 'person' NOT NULL,
	"display_name" text NOT NULL,
	"company_name" text,
	"primary_email" text,
	"primary_phone" text,
	"address" text,
	"notes" text,
	"source" text,
	"archived_at" timestamp,
	"created_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal_note" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text NOT NULL,
	"kind" "deal_note_kind" DEFAULT 'note' NOT NULL,
	"body" text NOT NULL,
	"happened_at" timestamp DEFAULT now() NOT NULL,
	"author_user_id" text,
	"author_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text,
	"primary_contact_id" text,
	"title" text NOT NULL,
	"description" text,
	"value_cents" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"probability" integer DEFAULT 20 NOT NULL,
	"stage" "deal_stage" DEFAULT 'lead' NOT NULL,
	"source" text,
	"expected_close_date" timestamp,
	"actual_close_date" timestamp,
	"won_order_id" text,
	"lost_reason" text,
	"owner_user_id" text,
	"archived_at" timestamp,
	"created_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"order_id" text,
	"metadata" jsonb,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"source" "comment_source" DEFAULT 'internal' NOT NULL,
	"author_id" text,
	"author_name" text,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by_id" text
);
--> statement-breakpoint
CREATE TABLE "share_view" (
	"id" serial PRIMARY KEY NOT NULL,
	"share_token" varchar(32) NOT NULL,
	"ip" varchar(45),
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "user_name" text;--> statement-breakpoint
ALTER TABLE "order_shot_asset" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "order_shot_asset" ADD COLUMN "visible_to_client" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "order_shot_comment" ADD COLUMN "source" "comment_source" DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_shot_comment" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "order_shot_comment" ADD COLUMN "resolved_by_id" text;--> statement-breakpoint
ALTER TABLE "order_shot_comment" ADD COLUMN "read_by_user_ids" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "perspective" text;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "altitude_meters" integer;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "movement" text;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "duration_sec" integer;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "reference_asset_url" text;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "is_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "order_shot" ADD COLUMN "approved_by_client" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_record_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "studio_status" "studio_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "property_lat" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "property_lng" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "share_token" varchar(32) NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "client_approval" varchar(16);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "weather_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "weather_refreshed_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_notes_internal" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "initials" varchar(4);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "accent_color" varchar(16) DEFAULT '#3F5A3A';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "language" varchar(8) DEFAULT 'de' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "timezone" varchar(64) DEFAULT 'Europe/Berlin' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notification_prefs" jsonb DEFAULT '{"projectAssignment":true,"clientComment":true,"shareApproval":true,"weatherWarning":true,"statusChange":true,"assetUploaded":false,"dashboardStartFilter":"all"}'::jsonb;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contact" ADD CONSTRAINT "customer_contact_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_note" ADD CONSTRAINT "deal_note_deal_id_deal_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_note" ADD CONSTRAINT "deal_note_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_primary_contact_id_customer_contact_id_fk" FOREIGN KEY ("primary_contact_id") REFERENCES "public"."customer_contact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_comment" ADD CONSTRAINT "order_comment_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_comment" ADD CONSTRAINT "order_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_comment" ADD CONSTRAINT "order_comment_resolved_by_id_user_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "company_display_name_idx" ON "company" USING btree ("display_name");--> statement-breakpoint
CREATE INDEX "customer_contact_customer_idx" ON "customer_contact" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_email_idx" ON "customer" USING btree ("primary_email");--> statement-breakpoint
CREATE INDEX "customer_display_name_idx" ON "customer" USING btree ("display_name");--> statement-breakpoint
CREATE INDEX "customer_company_idx" ON "customer" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "deal_note_deal_idx" ON "deal_note" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "deal_stage_idx" ON "deal" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "deal_customer_idx" ON "deal" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_created_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_comment_order_idx" ON "order_comment" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "share_view_token_idx" ON "share_view" USING btree ("share_token");--> statement-breakpoint
ALTER TABLE "order_shot_comment" ADD CONSTRAINT "order_shot_comment_resolved_by_id_user_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_record_id_customer_id_fk" FOREIGN KEY ("customer_record_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_shot_comment_shot_idx" ON "order_shot_comment" USING btree ("order_shot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_share_token_idx" ON "orders" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "orders_customer_record_idx" ON "orders" USING btree ("customer_record_id");--> statement-breakpoint
CREATE INDEX "orders_studio_status_idx" ON "orders" USING btree ("studio_status");