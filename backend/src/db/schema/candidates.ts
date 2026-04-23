// candidates table
import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";

export const candidates = pgTable("candidates", {
  id:              uuid("id").primaryKey().defaultRandom(),
  jobId:           uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  
  // Basic Info (Umurava Spec)
  firstName:       varchar("first_name", { length: 255 }),
  lastName:        varchar("last_name", { length: 255 }),
  fullName:        varchar("full_name", { length: 255 }), 
  email:           varchar("email", { length: 255 }),
  phone:           varchar("phone", { length: 50 }),
  headline:        varchar("headline", { length: 255 }),
  bio:             text("bio"),
  location:        varchar("location", { length: 255 }),
  
  // Structured Data (Umurava Spec)
  skills:          jsonb("skills_json"),              // [{name, level, yearsOfExperience}]
  languages:       jsonb("languages_json"),           // [{name, proficiency}]
  experience:      jsonb("experience_json"),           // [{company, role, description, ...}]
  education:       jsonb("education_json"),            // [{institution, degree, field, ...}]
  projects:        jsonb("projects_json"),             // [{name, description, link, ...}]
  certifications:  jsonb("certifications_json"),
  availability:   jsonb("availability_json"),         // {status, type, startDate}
  socialLinks:     jsonb("social_links_json"),
  
  // Internal Tracking
  experienceYears: integer("experience_years"),
  educationLevel:  varchar("education_level", { length: 100 }),
  currentPosition: varchar("current_position", { length: 255 }),
  profileData:     jsonb("profile_data"),             
  resumeUrl:       text("resume_url"),                
  source:          varchar("source", { length: 50 }).default("umurava"), 
  status:          varchar("status", { length: 50 }).default("new"), // new | reviewed | shortlist | reject
  createdAt:       timestamp("created_at").defaultNow(),
});

export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;