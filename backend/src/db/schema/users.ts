// users table
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id:        uuid("id").primaryKey().defaultRandom(),
  email:     varchar("email", { length: 255 }).notNull().unique(),
  password:  varchar("password", { length: 255 }).notNull(), // always hashed
  fullName:  varchar("full_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});