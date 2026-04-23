import { api } from '@/lib/api';

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  details?: any;
  createdAt: string;
}

export interface ActivityResponse {
  data: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const activityService = {
  async getMyActivity(page = 1, limit = 20): Promise<ActivityResponse> {
    return api.get<ActivityResponse>(`/api/activity?page=${page}&limit=${limit}`);
  },

  async getAllActivity(page = 1, limit = 20): Promise<ActivityResponse> {
    return api.get<ActivityResponse>(`/api/activity/all?page=${page}&limit=${limit}`);
  },
};