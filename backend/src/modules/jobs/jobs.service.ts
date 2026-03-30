// jobs service
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../config/db";
import { jobs } from "../../db/schema/jobs";
import { CreateJobInput, UpdateJobInput } from "./jobs.schema";

export const jobsService = {

  // ── Create a new job ───────────────────────────────────────────────────────
  async create(recruiterId: string, input: CreateJobInput) {
    const [job] = await db
      .insert(jobs)
      .values({ ...input, recruiterId })
      .returning();

    return job;
  },

  // ── Get all jobs for the logged-in recruiter (newest first) ───────────────
  async getAll(recruiterId: string) {
    return db
      .select()
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId))
      .orderBy(desc(jobs.createdAt)); // newest first
  },

  // ── Get one job (must belong to this recruiter) ───────────────────────────
  async getOne(jobId: string, recruiterId: string) {
    const [job] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.recruiterId, recruiterId) // security: can't access another recruiter's job
        )
      )
      .limit(1);

    return job || null;
  },

  // ── Update job fields ──────────────────────────────────────────────────────
  async update(jobId: string, recruiterId: string, input: UpdateJobInput) {
    const [updated] = await db
      .update(jobs)
      .set(input)
      .where(
        and(eq(jobs.id, jobId), eq(jobs.recruiterId, recruiterId))
      )
      .returning();

    return updated || null;
  },

  // ── Update job status only (open → screening → closed) ────────────────────
  async updateStatus(jobId: string, recruiterId: string, status: string) {
    const [updated] = await db
      .update(jobs)
      .set({ status })
      .where(
        and(eq(jobs.id, jobId), eq(jobs.recruiterId, recruiterId))
      )
      .returning();

    return updated || null;
  },

  // ── Delete a job (cascades to candidates + screening_results) ─────────────
  async remove(jobId: string, recruiterId: string) {
    const [deleted] = await db
      .delete(jobs)
      .where(
        and(eq(jobs.id, jobId), eq(jobs.recruiterId, recruiterId))
      )
      .returning({ id: jobs.id });

    return deleted || null;
  },
};