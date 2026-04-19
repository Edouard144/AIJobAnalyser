import { api } from '@/lib/api';

export interface ScreeningResult {
  id: string;
  rank: number;
  score: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  screenedAt: string;
  candidate: {
    id: string;
    fullName: string;
    email: string | null;
    skills: string[];
    experienceYears: number;
    educationLevel: string | null;
    currentPosition: string | null;
    resumeUrl: string | null;
    source: 'umurava' | 'external';
  };
}

export interface RunScreeningResponse {
  jobId: string;
  totalCandidates: number;
  shortlisted: number;
  results: ScreeningResult[];
}

export const screeningService = {
  async run(jobId: string, topN: number = 10): Promise<RunScreeningResponse> {
    return api.post<RunScreeningResponse>(`/api/jobs/${jobId}/screening/run?top=${topN}`);
  },

  async getResults(jobId: string): Promise<ScreeningResult[]> {
    return api.get<ScreeningResult[]>(`/api/jobs/${jobId}/screening/results`, true);
  },
};