import { api } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  answer: string;
  sources?: any[];
}

export interface ParsedFilters {
  skills?: string[];
  minExperience?: number;
  maxExperience?: number;
  education?: string;
  location?: string;
  source?: string;
}

export const aiService = {
  async chat(question: string, jobId?: string): Promise<ChatResponse> {
    return api.post<ChatResponse>('/api/ai/chat', { question, jobId });
  },

  async getChatHistory(jobId: string): Promise<{ messages: ChatMessage[] }> {
    return api.get<{ messages: ChatMessage[] }>(`/api/ai/chat/${jobId}`);
  },

  async parseFilter(query: string): Promise<ParsedFilters> {
    return api.post<ParsedFilters>('/api/ai/parse-filter', { query });
  },
};