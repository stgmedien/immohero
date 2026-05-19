ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refunded_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refunded_at" timestamp;