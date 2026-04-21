// candidates schema
import { z } from "zod";

// Flexible skill - accepts string, object, or anything with a name property
const skillSchema = z.any();

// Single structured candidate (flexible for JSON import)
export const candidateSchema = z.object({
  fullName:        z.string().min(2).optional(),
  firstName:       z.string().optional(),
  lastName:        z.string().optional(),
  name:            z.string().optional(),
  email:           z.string().optional(),
  phone:           z.string().optional(),
  skills:          z.any().optional(),
  experienceYears: z.number().optional().default(0),
  experience:      z.number().optional().default(0),
  educationLevel:  z.string().optional(),
  education:       z.string().optional(),
  currentPosition: z.string().optional(),
  position:        z.string().optional(),
  profileData: z.any().optional(),
  resumeUrl:       z.string().optional(),
  source:          z.string().optional().default("external"),
});

// Bulk insert — array of candidates (flexible)
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