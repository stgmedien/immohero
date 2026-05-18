CREATE TYPE "public"."consultation_status" AS ENUM('requested', 'confirmed', 'declined', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."meeting_provider" AS ENUM('google_meet', 'teams', 'zoom', 'custom');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'consultation_requested';--> statement-breakpoint
CREATE TABLE "consultation" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"customer_email" text NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"requested_start" timestamp NOT NULL,
	"requested_end" timestamp NOT NULL,
	"status" "consultation_status" DEFAULT 'requested' NOT NULL,
	"assigned_user_id" text,
	"google_event_id" text,
	"google_calendar_id" text,
	"google_html_link" text,
	"meeting_provider" "meeting_provider",
	"meeting_url" text,
	"customer_note" text,
	"internal_notes" text,
	"decline_reason" text,
	"confirmed_at" timestamp,
	"declined_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultation" ADD CONSTRAINT "consultation_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation" ADD CONSTRAINT "consultation_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consultation_order_idx" ON "consultation" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "consultation_status_idx" ON "consultation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "consultation_start_idx" ON "consultation" USING btree ("requested_start");