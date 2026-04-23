import { api } from '@/lib/api';

export interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'recruiter' | 'viewer';
  teamId?: string;
  createdAt: string;
}

export interface TeamResponse {
  members: TeamMember[];
}

export const teamService = {
  async getTeam(): Promise<TeamResponse> {
    return api.get<TeamResponse>('/api/team');
  },

  async invite(email: string, role?: string): Promise<{ inviteSent: boolean; email: string; role: string }> {
    return api.post<{ inviteSent: boolean; email: string; role: string }>('/api/team/invite', { email, role });
  },

  async updateRole(userId: string, role: string): Promise<TeamMember> {
    return api.patch<TeamMember>(`/api/team/${userId}/role`, { role });
  },

  async remove(userId: string): Promise<{ removed: boolean }> {
    return api.delete<{ removed: boolean }>(`/api/team/${userId}`);
  },
};