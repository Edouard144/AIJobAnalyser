// candidates table
import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";

export const candidates = pgTable("candidates", {
  id:              uuid("id").primaryKey().defaultRandom(),
  jobId:           uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  fullName:        varchar("full_name", { length: 255 }),
  email:           varchar("email", { length: 255 }),
  phone:           varchar("phone", { length: 50 }),
  skills:          text("skills").array(),            // TEXT[]
  experienceYears: integer("experience_years"),
  educationLevel:  varchar("education_level", { length: 100 }),
  currentPosition: varchar("current_position", { length: 255 }),
  profileData:     jsonb("profile_data"),             // full Umurava structured profile
  resumeUrl:       text("resume_url"),                // PDF link for external candidates
  source:          varchar("source", { length: 50 }).default("umurava"), // umurava | external
  createdAt:       timestamp("created_at").defaultNow(),
});