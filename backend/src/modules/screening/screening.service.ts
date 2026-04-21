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
    // Map AI results back to actual candidate UUIDs
    console.log('📊 AI Results received:', JSON.stringify(aiResults.slice(0, 3)));
    console.log('📊 Candidates available:', allCandidates.length);
    console.log('📊 First 3 candidates:', allCandidates.slice(0, 3).map(c => ({ id: c.id, name: c.fullName })));
    
    // Ensure we have candidates to work with
    if (allCandidates.length === 0) {
      throw new Error('No candidates found for this job');
    }
    
    const toInsert = aiResults.map((r, index) => {
      // Use index position directly - rank 1 = index 0, rank 2 = index 1, etc.
      // This is more reliable than relying on AI to return correct ranks
      const targetIndex = index < allCandidates.length ? index : 0;
      const candidate = allCandidates[targetIndex];
      
      if (!candidate || !candidate.id) {
        console.error(`⚠️ No candidate found at index ${index}`);
        throw new Error(`Invalid candidate at index ${index}`);
      }
      
      console.log(`🔗 Mapping index ${index} to candidate:`, candidate.fullName, candidate.id);
      
      const strengths = Array.isArray(r.strengths) ? r.strengths : [];
      const gaps = Array.isArray(r.gaps) ? r.gaps : [];
      
      return {
        jobId,
        candidateId:    candidate.id,
        rank:           index + 1,
        score:          String(Number(r.score || 50).toFixed(2)),
        strengths:      strengths,
        gaps:           gaps,
        recommendation: r.recommendation || '',
        rawAiOutput:    JSON.stringify(r),
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

    console.log('✅ Job status updated to: screening');

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
      .orderBy(screeningResults.rank);

    // Parse strengths and gaps from stored strings if needed
    return results.map(r => ({
      ...r,
      strengths: typeof r.strengths === 'string' ? [r.strengths] : (r.strengths || []),
      gaps: typeof r.gaps === 'string' ? [r.gaps] : (r.gaps || []),
    }));
  },
};