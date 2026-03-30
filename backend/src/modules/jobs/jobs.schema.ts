// jobs schema
import { z } from "zod";

export const createJobSchema = z.object({
  title:           z.string().min(3, "Title too short"),
  description:     z.string().min(10, "Description too short").optional(),
  requiredSkills:  z.array(z.string()).min(1, "At least one skill required"),
  experienceYears: z.number().int().min(0).max(30),
  educationLevel:  z.string().optional(),
  location:        z.string().optional(),
});

export const updateJobSchema = createJobSchema.partial(); // all fields optional for PATCH

export const updateJobStatusSchema = z.object({
  status: z.enum(["open", "screening", "closed"]),
});

export type CreateJobInput  = z.infer<typeof createJobSchema>;
export type UpdateJobInput  = z.infer<typeof updateJobSchema>;