// jobs schema
import { z } from "zod";

export const createJobSchema = z.object({
  title:           z.string().min(1, "Title is required"),
  description:     z.string().optional(),
  requiredSkills:  z.array(z.string()).optional(),
  experienceYears: z.number().int().min(0).max(30).optional(),
  educationLevel:  z.string().optional(),
  location:        z.string().optional(),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(["open", "screening", "closed"]).optional(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum(["open", "screening", "closed"]),
});

export const paginationSchema = z.object({
  page:    z.coerce.number().int().min(1).default(1),
  limit:   z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateJobInput  = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;