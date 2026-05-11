CREATE TYPE "public"."delivery_status" AS ENUM('draft', 'ready', 'sent');--> statement-breakpoint
CREATE TYPE "public"."order_shot_status" AS ENUM('planned', 'done', 'skipped', 'reshoot');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'scheduled', 'shooting', 'editing', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('wohnung', 'haus', 'villa', 'mfh', 'gewerbe', 'industrie', 'grundstueck', 'bauprojekt');--> statement-breakpoint
CREATE TYPE "public"."shot_asset_kind" AS ENUM('reference', 'raw', 'final');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'photographer', 'drone_pilot', 'editor', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" varchar(64) NOT NULL,
	"entity_type" varchar(32) NOT NULL,
	"entity_id" text,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundle" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"service_slugs" text[] NOT NULL,
	"discount_percent" integer NOT NULL,
	"recommended" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "bundle_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"status" "delivery_status" DEFAULT 'draft' NOT NULL,
	"zip_blob_url" text,
	"zip_blob_pathname" text,
	"zip_size_bytes" bigint,
	"share_token" varchar(32) NOT NULL,
	"expires_at" timestamp,
	"ready_at" timestamp,
	"sent_at" timestamp,
	"first_viewed_at" timestamp,
	"first_downloaded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_id" text NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"filename" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"mime_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"to_email" text NOT NULL,
	"template" varchar(64) NOT NULL,
	"subject" text NOT NULL,
	"resend_id" text,
	"order_id" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "order_assignment" (
	"order_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "user_role" NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_assignment_order_id_user_id_role_pk" PRIMARY KEY("order_id","user_id","role")
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"service_slug" varchar(64) NOT NULL,
	"service_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_shot_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"order_shot_id" text NOT NULL,
	"kind" "shot_asset_kind" NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"filename" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"mime_type" text NOT NULL,
	"uploaded_by_id" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_shot_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"order_shot_id" text NOT NULL,
	"author_id" text,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_shot" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"shot_definition_id" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"priority" text NOT NULL,
	"position" integer NOT NULL,
	"status" "order_shot_status" DEFAULT 'planned' NOT NULL,
	"notes" text,
	"completed_at" timestamp,
	"completed_by_id" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"customer_id" text,
	"customer_email" text NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"bundle_slug" varchar(64),
	"property_type" "property_type" NOT NULL,
	"property_address" text NOT NULL,
	"property_plz" varchar(5) NOT NULL,
	"property_city" text NOT NULL,
	"property_size_qm" integer,
	"property_notes" text,
	"scheduled_at" timestamp,
	"estimated_delivery_at" timestamp,
	"subtotal_cents" integer NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_area" (
	"id" serial PRIMARY KEY NOT NULL,
	"plz" varchar(5) NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"short_description" text NOT NULL,
	"long_description" text NOT NULL,
	"price_cents" integer NOT NULL,
	"duration_minutes" integer,
	"duration_label" text NOT NULL,
	"icon_key" varchar(32) NOT NULL,
	"category" varchar(32) NOT NULL,
	"style_package" varchar(32) NOT NULL,
	"property_types" text[] NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shot_definition" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"perspective" text NOT NULL,
	"altitude_meters" integer NOT NULL,
	"movement" text NOT NULL,
	"duration_sec" integer NOT NULL,
	"priority" text NOT NULL,
	"description" text NOT NULL,
	"property_template" text NOT NULL,
	"style_package" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"weekday" integer NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_time_off" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"phone" text,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_file" ADD CONSTRAINT "delivery_file_delivery_id_delivery_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."delivery"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_assignment" ADD CONSTRAINT "order_assignment_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_assignment" ADD CONSTRAINT "order_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shot_asset" ADD CONSTRAINT "order_shot_asset_order_shot_id_order_shot_id_fk" FOREIGN KEY ("order_shot_id") REFERENCES "public"."order_shot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shot_asset" ADD CONSTRAINT "order_shot_asset_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shot_comment" ADD CONSTRAINT "order_shot_comment_order_shot_id_order_shot_id_fk" FOREIGN KEY ("order_shot_id") REFERENCES "public"."order_shot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shot_comment" ADD CONSTRAINT "order_shot_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shot" ADD CONSTRAINT "order_shot_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shot" ADD CONSTRAINT "order_shot_shot_definition_id_shot_definition_id_fk" FOREIGN KEY ("shot_definition_id") REFERENCES "public"."shot_definition"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shot" ADD CONSTRAINT "order_shot_completed_by_id_user_id_fk" FOREIGN KEY ("completed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_availability" ADD CONSTRAINT "team_availability_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_time_off" ADD CONSTRAINT "team_time_off_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_shot_assets_shot_idx" ON "order_shot_asset" USING btree ("order_shot_id");--> statement-breakpoint
CREATE INDEX "order_shots_order_idx" ON "order_shot" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_short_code_idx" ON "orders" USING btree ("short_code");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "service_area_plz_idx" ON "service_area" USING btree ("plz");