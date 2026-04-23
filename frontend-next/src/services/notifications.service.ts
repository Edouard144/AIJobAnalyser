import { api } from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationsService = {
  async getAll(page = 1, limit = 20): Promise<NotificationsResponse> {
    return api.get<NotificationsResponse>(`/api/notifications?page=${page}&limit=${limit}`);
  },

  async markAsRead(id: string): Promise<{ read: boolean }> {
    return api.patch<{ read: boolean }>(`/api/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    return api.patch<{ success: boolean }>('/api/notifications/read-all');
  },
};