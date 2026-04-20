ALTER TABLE "candidates" ADD COLUMN "first_name" varchar(255);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "last_name" varchar(255);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "headline" varchar(255);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "location" varchar(255);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "skills_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "languages_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "experience_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "education_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "projects_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "certifications_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "availability_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "social_links_json" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "skills";