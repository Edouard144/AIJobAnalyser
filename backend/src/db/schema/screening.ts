// screening_results table
import { pgTable, uuid, integer, numeric, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { candidates } from "./candidates";

export const screeningResults = pgTable("screening_results", {
  id:             uuid("id").primaryKey().defaultRandom(),
  jobId:          uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  candidateId:    uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }).notNull(),
  rank:           integer("rank"),                  // 1 = best
  score:          numeric("score", { precision: 5, scale: 2 }), // 0.00 - 100.00
  strengths:      text("strengths").array(),        // ["5yrs React", "Led team"]
  gaps:           text("gaps").array(),             // ["No TypeScript"]
  recommendation: text("recommendation"),           // AI natural language verdict
  rawAiOutput:    jsonb("raw_ai_output"),           // full Gemini response (for debugging)
  screenedAt:     timestamp("screened_at").defaultNow(),
});