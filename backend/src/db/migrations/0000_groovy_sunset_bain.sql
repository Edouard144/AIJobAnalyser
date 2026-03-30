CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recruiter_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"required_skills" text[],
	"experience_years" integer,
	"education_level" varchar(100),
	"location" varchar(255),
	"status" varchar(50) DEFAULT 'open',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"full_name" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"skills" text[],
	"experience_years" integer,
	"education_level" varchar(100),
	"current_position" varchar(255),
	"profile_data" jsonb,
	"resume_url" text,
	"source" varchar(50) DEFAULT 'umurava',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "screening_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"rank" integer,
	"score" numeric(5, 2),
	"strengths" text[],
	"gaps" text[],
	"recommendation" text,
	"raw_ai_output" jsonb,
	"screened_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screening_results" ADD CONSTRAINT "screening_results_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screening_results" ADD CONSTRAINT "screening_results_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;