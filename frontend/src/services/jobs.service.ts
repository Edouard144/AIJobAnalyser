// Jobs service - handles job API calls
import { api } from '@/lib/api';

export interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string;
  status: 'open' | 'screening' | 'closed';
  skills: string[];
  experienceYears: number;
  educationLevel: string | null;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  title: string;
  description?: string;
  location: string;
  status?: 'open' | 'screening' | 'closed';
  skills: string[];
  experienceYears: number;
  educationLevel?: string;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  location?: string;
  skills?: string[];
  experienceYears?: number;
  educationLevel?: string;
}

export const jobsService = {
  async create(input: CreateJobInput): Promise<Job> {
    return api.post<Job>('/api/jobs', input);
  },

  async getAll(): Promise<Job[]> {
    return api.get<Job[]>('/api/jobs');
  },

  async getOne(id: string): Promise<Job> {
    return api.get<Job>(`/api/jobs/${id}`);
  },

  async update(id: string, input: UpdateJobInput): Promise<Job> {
    return api.patch<Job>(`/api/jobs/${id}`, input);
  },

  async updateStatus(id: string, status: 'open' | 'screening' | 'closed'): Promise<Job> {
    return api.patch<Job>(`/api/jobs/${id}/status`, { status });
  },

  async remove(id: string): Promise<{ id: string }> {
    return api.delete<{ id: string }>(`/api/jobs/${id}`);
  },
};
