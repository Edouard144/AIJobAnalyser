import { api } from '@/lib/api';

export interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise';
  planName: string;
  screeningsUsed: number;
  screeningsLimit: number;
  renewalDate: string;
  canUpgrade: boolean;
}

export interface BillingResponse {
  plan: string;
  planName: string;
  screeningsUsed: number;
  screeningsLimit: number;
  renewalDate: string;
  canUpgrade: boolean;
}

export const billingService = {
  async getBilling(): Promise<BillingResponse> {
    return api.get<BillingResponse>('/api/billing');
  },

  async upgrade(plan: string): Promise<{ plan: string; upgradeSuccess: boolean }> {
    return api.post<{ plan: string; upgradeSuccess: boolean }>('/api/billing/upgrade', { plan });
  },
};