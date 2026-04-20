import { api } from '@/lib/api';

export interface CandidateSkill {
  name: string;
  level: string;
  yearsOfExperience: number;
}

export interface CandidateLanguage {
  name: string;
  proficiency: string;
}

export interface CandidateExperience {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  technologies?: string[];
}

export interface CandidateEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
}

export interface CandidateProject {
  name: string;
  description?: string;
  technologies?: string[];
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface CandidateCertification {
  name: string;
  issuer: string;
  issueDate?: string;
}

export interface CandidateAvailability {
  status: string;
  type: string;
  startDate?: string;
}

export interface CandidateSocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  [key: string]: string | undefined;
}

export interface Candidate {
  id: string;
  jobId: string;
  
  // Basic Info
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  
  // Structured Data (Umurava Spec)
  skills: CandidateSkill[];
  languages? : CandidateLanguage[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  projects: CandidateProject[];
  certifications?: CandidateCertification[];
  availability?: CandidateAvailability | null;
  socialLinks?: CandidateSocialLinks | null;
  
  // Internal Tracking
  experienceYears: number | null;
  educationLevel: string | null;
  currentPosition: string | null;
  resumeUrl: string | null;
  source: 'umurava' | 'external';
  profileData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CandidateInput {
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: CandidateSkill[];
  languages?: CandidateLanguage[];
  experience?: CandidateExperience[];
  education?: CandidateEducation[];
  projects?: CandidateProject[];
  certifications?: CandidateCertification[];
  availability?: CandidateAvailability;
  socialLinks?: CandidateSocialLinks;
  
  // Internal overrides
  experienceYears?: number;
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