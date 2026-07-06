CREATE TABLE "academy_certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"serial" varchar(20) NOT NULL,
	"recipient_name" text NOT NULL,
	"course_title" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"source" varchar(24) DEFAULT 'self' NOT NULL,
	"status" varchar(12) DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "academy_lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"quiz_score" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy_course" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "academy_course" ADD COLUMN "price_cents" integer;--> statement-breakpoint
ALTER TABLE "academy_lesson" ADD COLUMN "quiz" jsonb;--> statement-breakpoint
ALTER TABLE "pilot_profile" ADD COLUMN "onboarding" jsonb;--> statement-breakpoint
ALTER TABLE "pilot_profile" ADD COLUMN "source" varchar(24) DEFAULT 'chatbot' NOT NULL;--> statement-breakpoint
ALTER TABLE "pilot_profile" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "academy_certificate" ADD CONSTRAINT "academy_certificate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_certificate" ADD CONSTRAINT "academy_certificate_course_id_academy_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollment" ADD CONSTRAINT "academy_enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollment" ADD CONSTRAINT "academy_enrollment_course_id_academy_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_lesson_progress" ADD CONSTRAINT "academy_lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_lesson_progress" ADD CONSTRAINT "academy_lesson_progress_lesson_id_academy_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."academy_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academy_certificate_serial_idx" ON "academy_certificate" USING btree ("serial");--> statement-breakpoint
CREATE INDEX "academy_certificate_user_idx" ON "academy_certificate" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_enrollment_user_course_idx" ON "academy_enrollment" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "academy_enrollment_course_idx" ON "academy_enrollment" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_progress_user_lesson_idx" ON "academy_lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "academy_progress_lesson_idx" ON "academy_lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
ALTER TABLE "pilot_profile" ADD CONSTRAINT "pilot_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pilot_profile_user_idx" ON "pilot_profile" USING btree ("user_id");