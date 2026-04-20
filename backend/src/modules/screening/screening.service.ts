// screening service
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { screeningResults } from "../../db/schema/screening";
import { candidates } from "../../db/schema/candidates";
import { jobs } from "../../db/schema/jobs";
import { geminiService } from "./gemini.service";

export const screeningService = {

  // ── Run full AI screening for a job ───────────────────────────────────────
  async runScreening(jobId: string, topN: number = 10) {

    // 1. Fetch the job — use eq with explicit uuid cast
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) throw new Error("Job not found");

    // 2. Fetch all candidates for this job
    const allCandidates = await db
      .select()
      .from(candidates)
      .where(eq(candidates.jobId, jobId));

    if (allCandidates.length === 0) {
      throw new Error("No candidates found for this job");
    }

    // 3. Send everything to Gemini
    const aiResults = await geminiService.screenCandidates(job, allCandidates, topN);

    // 4. Delete previous screening results for this job (fresh re-screen)
    await db
      .delete(screeningResults)
      .where(eq(screeningResults.jobId, jobId));

    // 5. Save all AI results to DB in one insert call
    const toInsert = aiResults.map((r) => ({
      jobId,
      candidateId:    r.candidateId,
      rank:           r.rank,
      score:          String(r.score),   // numeric stored as string in drizzle
      strengths:      r.strengths,
      gaps:           r.gaps,
      recommendation: r.recommendation,
      rawAiOutput:    r as unknown as Record<string, unknown>,
    }));

    const saved = await db
      .insert(screeningResults)
      .values(toInsert)
      .returning();

    return {
      jobId,
      totalCandidates: allCandidates.length,
      shortlisted:     saved.length,
      results:         saved,
    };
  },

  async generateInterviewKit(jobId: string, candidateId: string) {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, candidateId)).limit(1);

    if (!job || !candidate) throw new Error("Job or Candidate not found");

    return geminiService.generateInterviewKit(
      { title: job.title, requiredSkills: job.requiredSkills || [] },
      candidate
    );
  },

  // ── Get existing screening results for a job ───────────────────────────────
  async getResults(jobId: string) {
    // Join screening results with candidate info for a rich response
    const results = await db
      .select({
        id:             screeningResults.id,
        rank:           screeningResults.rank,
        score:          screeningResults.score,
        strengths:      screeningResults.strengths,
        gaps:           screeningResults.gaps,
        recommendation: screeningResults.recommendation,
        screenedAt:     screeningResults.screenedAt,
        candidate: {
          id:              candidates.id,
          firstName:       candidates.firstName,
          lastName:        candidates.lastName,
          fullName:        candidates.fullName,
          email:           candidates.email,
          skills:          candidates.skills,
          experienceYears: candidates.experienceYears,
          educationLevel:  candidates.educationLevel,
          currentPosition: candidates.currentPosition,
          resumeUrl:       candidates.resumeUrl,
          source:          candidates.source,
        },
      })
      .from(screeningResults)
      .innerJoin(candidates, eq(screeningResults.candidateId, candidates.id))
      .where(eq(screeningResults.jobId, jobId))
      .orderBy(screeningResults.rank); // return in rank order

    return results;
  },
};