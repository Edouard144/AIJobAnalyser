// jobs table
import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const jobs = pgTable("jobs", {
  id:              uuid("id").primaryKey().defaultRandom(),
  recruiterId:     uuid("recruiter_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title:           varchar("title", { length: 255 }).notNull(),
  description:     text("description"),
  requiredSkills:  text("required_skills").array(),   // TEXT[]
  experienceYears: integer("experience_years"),
  educationLevel:  varchar("education_level", { length: 100 }),
  location:        varchar("location", { length: 255 }),
  status:          varchar("status", { length: 50 }).default("open"), // open | screening | closed
  createdAt:       timestamp("created_at").defaultNow(),
}, (table) => ({
  idxRecruiter: { columns: [table.recruiterId] },
}));