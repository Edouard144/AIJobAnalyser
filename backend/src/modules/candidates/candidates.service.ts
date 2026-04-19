// candidates service
import { eq, and } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import { db } from "../../config/db";
import { candidates } from "../../db/schema/candidates";
import { jobs } from "../../db/schema/jobs";
import { CandidateInput } from "./candidates.schema";
import { geminiService } from "../screening/gemini.service";

export const candidatesService = {

  // ── Verify job exists and belongs to this recruiter ────────────────────────
  async verifyJobOwnership(jobId: string, recruiterId: string) {
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.recruiterId, recruiterId)))
      .limit(1);

    return job || null;
  },

  // ── Scenario 1: Bulk insert structured Umurava profiles ───────────────────
  async bulkInsert(jobId: string, inputs: CandidateInput[]) {
    // Insert all candidates in one DB call — much faster than looping
    const inserted = await db
      .insert(candidates)
      .values(inputs.map((c) => ({ ...c, jobId })))
      .returning();

    return inserted;
  },

  // ── Scenario 2: Parse CSV buffer and insert candidates ────────────────────
  async insertFromCSV(jobId: string, fileBuffer: Buffer) {
    // Parse CSV from memory buffer — no disk I/O
    const rows = parse(fileBuffer, {
      columns: true,        // use first row as column names
      skip_empty_lines: true,
      trim: true,           // remove whitespace from values
    }) as Record<string, string>[];

    if (rows.length === 0) throw new Error("CSV file is empty");

    // Map CSV columns to our candidate schema
    // Flexible — works even if some columns are missing
    const values = rows.map((row) => {
      // Handle separate firstName/lastName or combined fullName
      const fName = row.firstName || row.first_name || row.FirstName || "";
      const lName = row.lastName || row.last_name || row.LastName || "";
      const fullName = row.fullName || row.full_name || row.name || `${fName} ${lName}`.trim() || "Unknown";

      return {
        jobId,
        fullName,
        email:           row.email || row.Email || null,
        phone:           row.phone || row.Phone || null,
        skills:          (row.skills || row.Skills || "").split(",").map((s) => s.trim()).filter(Boolean),
        experienceYears: parseInt(row.experience_years || row.experience || row.Experience || "0") || 0,
        educationLevel:  row.education_level || row.education || row.Education || null,
        currentPosition: row.current_position || row.position || row.role || row.Role || null,
        resumeUrl:       row.resume_url || row.resume || row.Resume || null,
        source:          "external" as const,
        profileData:     row, // save full raw CSV row for AI context
      };
    });

    const inserted = await db
      .insert(candidates)
      .values(values)
      .returning();

    return inserted;
  },

  // ── Scenario 3: Parse PDF buffer using Gemini and insert candidate ────────
  async insertFromPDF(jobId: string, fileBuffer: Buffer) {
    const profile = await geminiService.parseResume(fileBuffer);
    
    if (!profile) throw new Error("Failed to parse resume with AI");

    const [inserted] = await db
      .insert(candidates)
      .values({
        jobId,
        fullName:        profile.fullName,
        email:           profile.email,
        phone:           profile.phone,
        skills:          profile.skills,
        experienceYears: profile.experienceYears,
        educationLevel:  profile.educationLevel,
        currentPosition: profile.currentPosition,
        source:          "external",
        profileData:     profile, // Save AI parsed profile data
      })
      .returning();

    return inserted;
  },

  // ── Get all candidates for a job ──────────────────────────────────────────
  async getByJob(jobId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db
      .select({ count: candidates.id })
      .from(candidates)
      .where(eq(candidates.jobId, jobId));

    const total = Number(countResult?.count) || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(candidates)
      .where(eq(candidates.jobId, jobId))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // ── Get one candidate ─────────────────────────────────────────────────────
  async getOne(candidateId: string, jobId: string) {
    const [candidate] = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.id, candidateId), eq(candidates.jobId, jobId)))
      .limit(1);

    return candidate || null;
  },

  // ── Delete one candidate ──────────────────────────────────────────────────
  async remove(candidateId: string, jobId: string) {
    const [deleted] = await db
      .delete(candidates)
      .where(and(eq(candidates.id, candidateId), eq(candidates.jobId, jobId)))
      .returning({ id: candidates.id });

    return deleted || null;
  },

  // ── Delete ALL candidates for a job (before re-uploading) ─────────────────
  async removeAll(jobId: string) {
    await db.delete(candidates).where(eq(candidates.jobId, jobId));
  },
};