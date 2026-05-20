CREATE TYPE "public"."asset_reaction_kind" AS ENUM('favorite', 'comment');--> statement-breakpoint
CREATE TABLE "asset_reaction" (
	"id" text PRIMARY KEY NOT NULL,
	"order_shot_asset_id" text NOT NULL,
	"kind" "asset_reaction_kind" NOT NULL,
	"author_email" text,
	"body" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"customer_email" text NOT NULL,
	"score" integer,
	"comment" text,
	"token" varchar(32) DEFAULT replace(gen_random_uuid()::text, '-', '') NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"uploaded_by_user_id" text,
	"filename" text NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"mime_type" text NOT NULL,
	"kind" varchar(32) DEFAULT 'customer_supplied' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_code" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(16) NOT NULL,
	"owner_customer_id" text,
	"owner_email" text,
	"discount_cents" integer DEFAULT 5000 NOT NULL,
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "preferred_channel" varchar(16) DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "whatsapp_phone" varchar(32);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "referred_by_code" varchar(16);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "reminder_24_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "reminder_2_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "feedback_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "rebooking_mail_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "asset_reaction" ADD CONSTRAINT "asset_reaction_order_shot_asset_id_order_shot_asset_id_fk" FOREIGN KEY ("order_shot_asset_id") REFERENCES "public"."order_shot_asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_attachment" ADD CONSTRAINT "order_attachment_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_attachment" ADD CONSTRAINT "order_attachment_uploaded_by_user_id_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_owner_customer_id_customer_id_fk" FOREIGN KEY ("owner_customer_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_reaction_asset_idx" ON "asset_reaction" USING btree ("order_shot_asset_id");--> statement-breakpoint
CREATE INDEX "feedback_order_idx" ON "feedback" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "feedback_token_idx" ON "feedback" USING btree ("token");--> statement-breakpoint
CREATE INDEX "order_attachment_order_idx" ON "order_attachment" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_code_code_idx" ON "referral_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "referral_code_owner_idx" ON "referral_code" USING btree ("owner_customer_id");