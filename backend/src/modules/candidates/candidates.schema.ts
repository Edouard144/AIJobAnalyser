// candidates schema
import { z } from "zod";

// Skill entry structure
const skillSchema = z.object({
  name: z.string().min(1),
  level: z.string().optional().default("Intermediate"),
  yearsOfExperience: z.number().int().min(0).default(1),
});

// Single structured candidate (Scenario 1 — Umurava profile)
export const candidateSchema = z.object({
  fullName:        z.string().min(2),
  email:           z.string().email().optional(),
  phone:           z.string().optional(),
  skills:          z.array(skillSchema).min(1, "At least one skill required"),
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

// Pagination query params
export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CandidateInput = z.infer<typeof candidateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;