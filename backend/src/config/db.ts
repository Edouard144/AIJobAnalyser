import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema/index";
import { env } from "./env";

// neon() creates an HTTP-based SQL connection (faster on serverless/edge)
const sql = neon(env.DATABASE_URL);

// db is what you import everywhere to run queries
export const db = drizzle(sql, { schema });