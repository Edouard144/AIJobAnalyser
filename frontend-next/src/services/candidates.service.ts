import { api } from '@/lib/api';

export interface Candidate {
  id: string;
  jobId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  experienceYears: number;
  educationLevel: string | null;
  currentPosition: string | null;
  resumeUrl: string | null;
  source: 'umurava' | 'external';
  profileData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateInput {
  fullName: string;
  email?: string;
  phone?: string;
  skills: string[];
  experienceYears: number;
  educationLevel?: string;
  currentPosition?: string;
  resumeUrl?: string;
  source?: 'umurava' | 'external';
  profileData?: Record<string, unknown>;
}

export interface BulkInsertResponse {
  inserted: number;
  candidates: Candidate[];
}

export interface UploadCsvResponse {
  inserted: number;
  candidates: Candidate[];
}

export const candidatesService = {
  async bulkInsert(jobId: string, candidates: CandidateInput[]): Promise<BulkInsertResponse> {
    return api.post<BulkInsertResponse>(`/api/jobs/${jobId}/candidates/bulk`, { candidates });
  },

  async uploadCsv(jobId: string, file: File): Promise<UploadCsvResponse> {
    return api.uploadFile<UploadCsvResponse>(`/api/jobs/${jobId}/candidates/upload-csv`, file);
  },

  async uploadPdf(jobId: string, file: File): Promise<UploadCsvResponse> {
    return api.uploadFile<UploadCsvResponse>(`/api/jobs/${jobId}/candidates/upload-pdf`, file);
  },

  async getByJob(jobId: string): Promise<Candidate[]> {
    return api.get<Candidate[]>(`/api/jobs/${jobId}/candidates`);
  },

  async getOne(jobId: string, candidateId: string): Promise<Candidate> {
    return api.get<Candidate>(`/api/jobs/${jobId}/candidates/${candidateId}`);
  },

  async remove(jobId: string, candidateId: string): Promise<{ id: string }> {
    return api.delete<{ id: string }>(`/api/jobs/${jobId}/candidates/${candidateId}`);
  },

  async removeAll(jobId: string): Promise<null> {
    return api.delete<null>(`/api/jobs/${jobId}/candidates`);
  },
};