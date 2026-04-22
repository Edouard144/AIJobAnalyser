// users table
import { pgTable, uuid, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id:        uuid("id").primaryKey().defaultRandom(),
  email:     varchar("email", { length: 255 }).notNull().unique(),
  password:  varchar("password", { length: 255 }).notNull(),
  fullName:  varchar("full_name", { length: 255 }),
  
  // New fields
  onboardingCompleted: boolean("onboarding_completed").default(false),
  language: varchar("language", { length: 10 }).default("en"),
  theme: varchar("theme", { length: 10 }).default("dark"),
  role: varchar("role", { length: 20 }).default("recruiter"), // admin, recruiter, viewer
  teamId: uuid("team_id"),
  plan: varchar("plan", { length: 20 }).default("free"), // free, pro, enterprise
  usageCount: varchar("usage_count", { length: 10 }).default("0"),
  billingCycleStart: timestamp("billing_cycle_start"),
  
  // Email verification
  emailVerified: boolean("email_verified").default(false),
  otpCode: varchar("otp_code", { length: 6 }),
  otpExpiresAt: timestamp("otp_expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;