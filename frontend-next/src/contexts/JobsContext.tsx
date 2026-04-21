'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { jobsService, type Job as ApiJob } from '@/services/jobs.service';
import { candidatesService, type Candidate as ApiCandidate } from '@/services/candidates.service';
import { screeningService, type ScreeningResult as ApiScreeningResult } from '@/services/screening.service';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: number;
  education: string;
  source: 'Umurava' | 'External';
  addedAt: string;
  position?: string;
}

export interface ScreeningResult {
  candidateId: string;
  candidateName: string;
  position: string;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  shortlisted: boolean;
  whyNot?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  status: 'open' | 'screening' | 'closed';
  skills: string[];
  experience: number;
  education: string;
  candidates: Candidate[];
  results: ScreeningResult[];
  createdAt: string;
}

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  addJob: (job: Omit<Job, 'id' | 'candidates' | 'results' | 'createdAt'>) => Promise<Job>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  addCandidates: (jobId: string, candidates: Omit<Candidate, 'id' | 'addedAt'>[]) => Promise<void>;
  uploadCsv: (jobId: string, file: File) => Promise<void>;
  setResults: (jobId: string, results: ScreeningResult[]) => void;
  runScreening: (jobId: string, topN: number) => Promise<void>;
  fetchJobs: () => Promise<void>;
}

const JobsContext = createContext<JobsContextType | null>(null);

function convertApiJob(apiJob: ApiJob, candidates: Candidate[] = [], results: ScreeningResult[] = []): Job {
  return {
    id: apiJob.id,
    title: apiJob.title,
    description: apiJob.description || '',
    location: apiJob.location,
    status: apiJob.status,
    skills: apiJob.requiredSkills || [],
    experience: apiJob.experienceYears || 0,
    education: apiJob.educationLevel || 'any',
    candidates,
    results,
    createdAt: apiJob.createdAt,
  };
}

function convertApiCandidate(apiCandidate: ApiCandidate): Candidate {
  return {
    id: apiCandidate.id,
    name: apiCandidate.fullName,
    email: apiCandidate.email || '',
    skills: Array.isArray(apiCandidate.skills) 
      ? apiCandidate.skills.map((s: any) => typeof s === 'string' ? s : s.name) 
      : [],
    experience: apiCandidate.experienceYears || 0,
    education: apiCandidate.educationLevel || 'any',
    source: apiCandidate.source === 'umurava' ? 'Umurava' : 'External',
    addedAt: apiCandidate.createdAt,
    position: apiCandidate.currentPosition || undefined,
  };
}

function convertApiScreeningResult(apiResult: any): ScreeningResult {
  const candidateName = apiResult.candidate.fullName || `${apiResult.candidate.firstName || ''} ${apiResult.candidate.lastName || ''}`.trim() || 'Unknown Candidate';
  return {
    candidateId: apiResult.candidate.id,
    candidateName: candidateName,
    position: apiResult.candidate.currentPosition || 'Candidate',
    rank: apiResult.rank,
    score: parseFloat(apiResult.score),
    strengths: Array.isArray(apiResult.strengths) ? apiResult.strengths : [],
    gaps: Array.isArray(apiResult.gaps) ? apiResult.gaps : [],
    recommendation: apiResult.recommendation || '',
    shortlisted: false,
    whyNot: apiResult.gaps?.length > 0 ? apiResult.gaps.join(', ') : undefined,
  };
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setLoading(true);
    try {
      const response = await jobsService.getAll() as any;
      const apiJobs = response.data || [];
      const jobsWithDetails = await Promise.all(
        apiJobs.map(async (apiJob: any) => {
          try {
            const [apiCandidates, apiResults] = await Promise.all([
              candidatesService.getByJob(apiJob.id).catch(() => []),
              screeningService.getResults(apiJob.id).catch(() => []),
            ]);

            const candidates = apiCandidates.map(convertApiCandidate);
            const results = apiResults.map(convertApiScreeningResult);

            const shortlistedCount = Math.min(10, results.length);
            const resultsWithShortlist = results.map((r, i) => ({
              ...r,
              shortlisted: i < shortlistedCount,
            }));

            return convertApiJob(apiJob, candidates, resultsWithShortlist);
          } catch {
            return convertApiJob(apiJob);
          }
        })
      );
      setJobs(jobsWithDetails);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = useCallback(async (data: Omit<Job, 'id' | 'candidates' | 'results' | 'createdAt'>) => {
    const apiJob = await jobsService.create({
      title: data.title,
      description: data.description || undefined,
      location: data.location,
      status: data.status,
      requiredSkills: data.skills.length > 0 ? data.skills : undefined,
      experienceYears: data.experience > 0 ? data.experience : undefined,
      educationLevel: data.education !== 'any' ? data.education : undefined,
    });

    const newJob = convertApiJob(apiJob);
    setJobs(prev => [...prev, newJob]);
    return newJob;
  }, []);

  const updateJob = useCallback(async (id: string, data: Partial<Job>) => {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.skills !== undefined) updateData.requiredSkills = data.skills;
    if (data.experience !== undefined) updateData.experienceYears = data.experience;
    if (data.education !== undefined) updateData.educationLevel = data.education !== 'any' ? data.education : undefined;

    const apiJob = await jobsService.update(id, updateData);
    const updatedJob = convertApiJob(apiJob);

    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updatedJob } : j));
  }, []);

  const getJob = useCallback((id: string) => {
    return jobs.find(j => j.id === id);
  }, [jobs]);

  const addCandidates = useCallback(async (jobId: string, candidates: Omit<Candidate, 'id' | 'addedAt'>[]) => {
    const candidateInputs = candidates.map(c => ({
      fullName: c.name,
      email: c.email || undefined,
      skills: c.skills.map((name: string) => ({ name, level: "Intermediate", yearsOfExperience: 1 })),
      experienceYears: c.experience,
      educationLevel: c.education !== 'any' ? c.education : undefined,
      currentPosition: c.position || undefined,
      source: c.source === 'Umurava' ? 'umurava' as const : 'external' as const,
    }));

    const response = await candidatesService.bulkInsert(jobId, candidateInputs);
    const newCandidates = response.candidates.map(convertApiCandidate);

    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return { ...j, candidates: [...j.candidates, ...newCandidates] };
    }));
  }, []);

  const uploadCsv = useCallback(async (jobId: string, file: File) => {
    const response = await candidatesService.uploadCsv(jobId, file);
    const newCandidates = response.candidates.map(convertApiCandidate);

    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return { ...j, candidates: [...j.candidates, ...newCandidates] };
    }));
  }, []);

  const setResults = useCallback((jobId: string, results: ScreeningResult[]) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, results, status: 'screening' as const } : j));
  }, []);

  const runScreening = useCallback(async (jobId: string, topN: number) => {
    const response = await screeningService.run(jobId, topN);
    const results = response.results.map(convertApiScreeningResult);

    const resultsWithShortlist = results.map((r, i) => ({
      ...r,
      shortlisted: i < topN,
    }));

    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return { ...j, results: resultsWithShortlist, status: 'screening' as const };
    }));
  }, []);

  return (
    <JobsContext.Provider value={{
      jobs,
      loading,
      addJob,
      updateJob,
      getJob,
      addCandidates,
      uploadCsv,
      setResults,
      runScreening,
      fetchJobs
    }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within JobsProvider');
  return ctx;
}