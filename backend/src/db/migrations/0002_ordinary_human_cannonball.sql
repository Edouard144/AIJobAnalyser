ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "language" varchar(10) DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "theme" varchar(10) DEFAULT 'dark';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(20) DEFAULT 'recruiter';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "team_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" varchar(20) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "usage_count" varchar(10) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_cycle_start" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_code" varchar(6);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "status" varchar(50) DEFAULT 'new';