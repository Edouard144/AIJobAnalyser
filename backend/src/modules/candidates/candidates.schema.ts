// candidates schema
import { z } from "zod";

// Single structured candidate (Scenario 1 — Umurava profile)
export const candidateSchema = z.object({
  fullName:        z.string().min(2),
  email:           z.string().email().optional(),
  phone:           z.string().optional(),
  skills:          z.array(z.string()).min(1, "At least one skill required"),
  experienceYears: z.number().int().min(0),
  educationLevel:  z.string().optional(),
  currentPosition: z.string().optional(),
  profileData: z.object({}).passthrough().optional(),
  resumeUrl:       z.string().url().optional(),
  source:          z.enum(["umurava", "external"]).default("umurava"),
});

// Bulk insert — array of candidates (Scenario 1)
export const bulkCandidatesSchema = z.object({
  candidates: z.array(candidateSchema).min(1, "At least one candidate required"),
});

export type CandidateInput = z.infer<typeof candidateSchema>;