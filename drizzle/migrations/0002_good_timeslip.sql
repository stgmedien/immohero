CREATE TABLE "lead" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"voucher_code" varchar(16) NOT NULL,
	"voucher_amount_cents" integer DEFAULT 1500 NOT NULL,
	"min_order_cents" integer DEFAULT 19900 NOT NULL,
	"stripe_coupon_id" text,
	"stripe_promotion_code_id" text,
	"consent_marketing" boolean DEFAULT true NOT NULL,
	"consent_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(32) DEFAULT 'messe-2026' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"redeemed_at" timestamp,
	"redeemed_order_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery" ALTER COLUMN "share_token" SET DEFAULT replace(gen_random_uuid()::text, '-', '');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "share_token" SET DEFAULT replace(gen_random_uuid()::text, '-', '');--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_redeemed_order_id_orders_id_fk" FOREIGN KEY ("redeemed_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lead_email_idx" ON "lead" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "lead_voucher_code_idx" ON "lead" USING btree ("voucher_code");--> statement-breakpoint
CREATE INDEX "lead_promo_code_idx" ON "lead" USING btree ("stripe_promotion_code_id");