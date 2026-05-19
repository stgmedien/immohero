CREATE TYPE "public"."property_submission_status" AS ENUM('pending', 'approved', 'rejected', 'converted');--> statement-breakpoint
CREATE TABLE "property_submission" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_record_id" text NOT NULL,
	"submitted_by_user_id" text,
	"submitted_by_email" text NOT NULL,
	"property_type" "property_type" NOT NULL,
	"property_address" text NOT NULL,
	"property_plz" varchar(5) NOT NULL,
	"property_city" text NOT NULL,
	"property_size_qm" integer,
	"property_notes" text,
	"desired_timeframe" text,
	"uploads" jsonb,
	"status" "property_submission_status" DEFAULT 'pending' NOT NULL,
	"converted_order_id" text,
	"review_notes" text,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "is_abo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "abo_service_slugs" text[];--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "abo_bundle_slug" varchar(64);--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "abo_notes" text;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "abo_activated_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "origin" varchar(16) DEFAULT 'booking' NOT NULL;--> statement-breakpoint
ALTER TABLE "property_submission" ADD CONSTRAINT "property_submission_customer_record_id_customer_id_fk" FOREIGN KEY ("customer_record_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_submission" ADD CONSTRAINT "property_submission_submitted_by_user_id_user_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_submission" ADD CONSTRAINT "property_submission_converted_order_id_orders_id_fk" FOREIGN KEY ("converted_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_submission" ADD CONSTRAINT "property_submission_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "property_submission_customer_idx" ON "property_submission" USING btree ("customer_record_id");--> statement-breakpoint
CREATE INDEX "property_submission_status_idx" ON "property_submission" USING btree ("status");