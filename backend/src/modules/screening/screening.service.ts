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
    console.log('[Screening Service] Starting for job:', jobId, 'topN:', topN);

    // 1. Fetch the job — use eq with explicit uuid cast
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) throw new Error("Job not found");
    console.log('[Screening Service] Job found:', job.title);

    // 2. Fetch all candidates for this job
    const allCandidates = await db
      .select()
      .from(candidates)
      .where(eq(candidates.jobId, jobId));

    console.log('[Screening Service] Candidates found:', allCandidates.length);
    if (allCandidates.length === 0) {
      throw new Error("No candidates found for this job");
    }

    // 3. Send everything to Gemini
    console.log('[Screening Service] Calling Gemini service...');
    const aiResults = await geminiService.screenCandidates(job, allCandidates, topN);
    console.log('[Screening Service] AI results:', aiResults.length);

// 4. Delete previous screening results for this job (fresh re-screen)
    await db
      .delete(screeningResults)
      .where(eq(screeningResults.jobId, jobId));

    // 5. Save all AI results to DB - use actual candidateId from AI results
    if (allCandidates.length === 0) {
      throw new Error('No candidates found for this job');
    }
    
    // Build a map of candidates by their ID for quick lookup
    const candidateMap = new Map(allCandidates.map(c => [c.id, c]));
    
    const toInsert = aiResults.map((r, index) => {
      // Use the candidateId from AI result, not the array index
      const candidateId = r.candidateId || allCandidates[index]?.id;
      const candidate = candidateMap.get(candidateId) || allCandidates[index];
      
      if (!candidate || !candidate.id) {
        console.error(`No candidate found for ID: ${candidateId}`);
        throw new Error(`Invalid candidate at index ${index}`);
      }
      
      const strengths = Array.isArray(r.strengths) ? r.strengths : [];
      const gaps = Array.isArray(r.gaps) ? r.gaps : [];
      
      return {
        jobId: jobId,
        candidateId: candidate.id,
        rank: r.rank || (index + 1),
        score: String(Number(r.score || 50).toFixed(2)),
        strengths: strengths,
        gaps: gaps,
        recommendation: r.recommendation || '',
        rawAiOutput: JSON.stringify(r),
      };
    });

const saved = await db
      .insert(screeningResults)
      .values(toInsert)
      .returning();

    // 6. Update job status to "screening" after running screening
    await db
      .update(jobs)
      .set({ status: "screening" })
      .where(eq(jobs.id, jobId));

    // 7. Return full results with candidate info (same format as getResults)
    const fullResults = saved.map(savedResult => {
      const candidate = candidateMap.get(savedResult.candidateId);
      return {
        ...savedResult,
        candidate: candidate ? {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          fullName: candidate.fullName,
          email: candidate.email,
          skills: candidate.skills,
          experienceYears: candidate.experienceYears,
          educationLevel: candidate.educationLevel,
          currentPosition: candidate.currentPosition,
          resumeUrl: candidate.resumeUrl,
          source: candidate.source,
        } : null,
      };
    });

    return {
      jobId,
      totalCandidates: allCandidates.length,
      shortlisted:     saved.length,
      results:         fullResults,
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
      .orderBy(screeningResults.rank);

    // Parse strengths and gaps from stored strings if needed
    return results.map(r => ({
      ...r,
      strengths: typeof r.strengths === 'string' ? [r.strengths] : (r.strengths || []),
      gaps: typeof r.gaps === 'string' ? [r.gaps] : (r.gaps || []),
    }));
  },

  async getPreview(jobId: string) {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) throw new Error("Job not found");
    
    const candidatesData = await db
      .select({
        id: candidates.id,
        fullName: candidates.fullName,
        email: candidates.email,
        skills: candidates.skills,
        experienceYears: candidates.experienceYears,
        educationLevel: candidates.educationLevel,
        currentPosition: candidates.currentPosition,
      })
      .from(candidates)
      .where(eq(candidates.jobId, jobId))
      .limit(5);
    
    return {
      job: { id: job.id, title: job.title, requiredSkills: job.requiredSkills },
      candidates: candidatesData,
      totalCount: candidatesData.length,
    };
  },
};