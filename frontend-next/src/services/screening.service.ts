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
    firstName: string | null;
    lastName: string | null;
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

export interface ScreeningStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  resultsCount?: number;
}

export const screeningService = {
  async run(jobId: string, topN: number = 10): Promise<RunScreeningResponse> {
    return api.post<RunScreeningResponse>(`/api/jobs/${jobId}/screening/run?top=${topN}`);
  },

  async getResults(jobId: string): Promise<ScreeningResult[]> {
    return api.get<ScreeningResult[]>(`/api/jobs/${jobId}/screening/results`, true);
  },

  async getInterviewKit(jobId: string, candidateId: string): Promise<string[]> {
    return api.get<string[]>(`/api/jobs/${jobId}/screening/candidates/${candidateId}/interview-kit`);
  },

  async getStatus(screeningId: string): Promise<ScreeningStatus> {
    return api.get<ScreeningStatus>(`/api/screening/${screeningId}/status`);
  },

  async exportResults(jobId: string, screeningId: string): Promise<Blob> {
    const response = await fetch(`/api/jobs/${jobId}/screening/export/${screeningId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    return response.blob();
  },

  async getProgress(jobId: string): Promise<EventSource> {
    return new EventSource(`/api/jobs/${jobId}/screening/progress?jobId=${jobId}`);
  },
};