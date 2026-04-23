// activity_logs table
import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import { jobs } from "./jobs";

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(), // screening_run, candidate_uploaded, job_created, etc.
  target: varchar("target", { length: 255 }), // job ID or candidate ID
  description: varchar("description", { length: 500 }), // human-readable description
  details: jsonb("details"), // extra information
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;