// Insights module — aggregated statistics for dashboard
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "../../config/db";
import { jobs } from "../../db/schema/jobs";
import { candidates } from "../../db/schema/candidates";
import { screeningResults } from "../../db/schema/screening";

export const insightsService = {
  // Get all dashboard stats in ONE query
  async getDashboardStats(userId: string) {
    // Get all jobs with candidate counts in one query
    const jobsWithCounts = await db
      .select({
        id: jobs.id,
        status: jobs.status,
        _count: { candidates: candidates.id },
      })
      .from(jobs)
      .leftJoin(candidates, eq(jobs.id, candidates.jobId))
      .where(eq(jobs.recruiterId, userId))
      .groupBy(jobs.id);

    const totalJobs = jobsWithCounts.length;
    const totalCandidates = jobsWithCounts.reduce((sum, j) => {
      const count = j._count?.candidates;
      // PostgreSQL COUNT returns bigint, string, or number depending on driver
      const numeric = typeof count === 'bigint' ? Number(count) : (typeof count === 'number' ? count : Number(count) || 0);
      return sum + numeric;
    }, 0);

    // Count jobs that have at least one screening result (status === 'screening')
    const screeningsRun = jobsWithCounts.filter(j => j.status === 'screening').length;

    // Compute average match score from screening results for up to 3 most recent jobs
    let totalScore = 0;
    let scoreCount = 0;
    for (const job of jobsWithCounts.slice(0, 3)) {
      const results = await db
        .select({ score: screeningResults.score })
        .from(screeningResults)
        .where(eq(screeningResults.jobId, job.id));
      results.forEach(r => {
        const score = parseFloat(r.score as any) || 0;
        if (score > 0) {
          totalScore += score;
          scoreCount++;
        }
      });
    }
    const avgMatch = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
      totalJobs,
      totalCandidates,
      screeningsRun,
      avgMatch,
    };
  },

  async getScreeningActivity(userId: string) {
    // Last 7 days of screening activity
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      // Count screening results created on this day
      const count = await db
        .select({ count: screeningResults.id })
        .from(screeningResults)
        .leftJoin(candidates, eq(screeningResults.candidateId, candidates.id))
        .leftJoin(jobs, eq(candidates.jobId, jobs.id))
        .where(
          and(
            eq(jobs.recruiterId, userId),
            gte(screeningResults.screenedAt, startDate),
            lte(screeningResults.screenedAt, endDate)
          )
        );
      const countValue = Number(count[0]?.count) || 0;
      days.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        screenings: countValue || 0,
      });
    }
    return days;
  },

  async getScoreDistribution(userId: string) {
    // Get all screening results for user's jobs
    const results = await db
      .select({ score: screeningResults.score })
      .from(screeningResults)
      .leftJoin(candidates, eq(screeningResults.candidateId, candidates.id))
      .leftJoin(jobs, eq(candidates.jobId, jobs.id))
      .where(eq(jobs.recruiterId, userId));

    let high = 0, mid = 0, low = 0;
    results.forEach(r => {
      const score = parseFloat(r.score as any) || 0;
      if (score >= 85) high++;
      else if (score >= 60) mid++;
      else low++;
    });

    if (results.length === 0) {
      return [
        { name: '85%+', value: 0, fill: '#22c55e' },
        { name: '60-84%', value: 0, fill: '#eab308' },
        { name: '<60%', value: 0, fill: '#ef4444' },
      ];
    }

    return [
      { name: '85%+', value: high, fill: '#22c55e' },
      { name: '60-84%', value: mid, fill: '#eab308' },
      { name: '<60%', value: low, fill: '#ef4444' },
    ];
  },

  async getTopSkills(userId: string) {
    // Get all candidates for user's jobs with skills
    const allCandidates = await db
      .select({ skills: candidates.skills })
      .from(candidates)
      .leftJoin(jobs, eq(candidates.jobId, jobs.id))
      .where(eq(jobs.recruiterId, userId));

    const skillCounts: Record<string, number> = {};
    allCandidates.forEach(c => {
      const skills = c.skills as any[] || [];
      skills.forEach((s: any) => {
        const name = typeof s === 'string' ? s : s.name;
        if (name) skillCounts[name] = (skillCounts[name] || 0) + 1;
      });
    });

    const sorted = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    if (sorted.length === 0) return [];

    const maxCount = sorted[0]?.count || 1;
    return sorted.map(s => ({ ...s, maxCount }));
  },
};
