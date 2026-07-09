ALTER TYPE "public"."order_status" ADD VALUE 'inquiry' BEFORE 'pending';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'offer_sent' BEFORE 'pending';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "quoted_price_cents" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "offer_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_url" text;