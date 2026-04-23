// AIRECRUIT API Client
const API_BASE = 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('accessToken');

export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!localStorage.getItem('accessToken');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

interface RequestOptions extends RequestInit {
  timeout?: number;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  // Add timeout (30 seconds default)
  const { timeout = 30000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { ...headers(), ...options.headers },
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        clearAuth();
        window.location.href = '/login';
      }
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    
    const data = await res.json();
    return data.data || data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Auth
export const authApi = {
  login: (email: string, password: string) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  register: (firstName: string, lastName: string, email: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ firstName, lastName, email, password }) }),
  
  getMe: () => request('/auth/me'),
  
  sendOTP: (email: string) => 
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  
  verifyOTP: (email: string, otp: string) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  
  updateProfile: (data: { language?: string; theme?: string; onboardingCompleted?: boolean }) =>
    request('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  
  logout: () => {
    clearAuth();
    window.location.href = '/login';
  },
};

// Jobs
export const jobsApi = {
  getAll: () => request('/jobs'),
  
  getOne: (id: string) => request(`/jobs/${id}`),
  
  create: (job: {
    title: string;
    description?: string;
    requiredSkills?: string[];
    location?: string;
    experienceYears?: number;
  }) => request('/jobs', { method: 'POST', body: JSON.stringify(job) }),
  
  update: (id: string, data: Partial<{
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    skills: string[];
    status: string;
    experienceYears: number;
  }>) => request(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: string) => request(`/jobs/${id}`, { method: 'DELETE' }),
  
  // Candidates per job
  getCandidates: (jobId: string, page?: number, limit?: number) => 
    request(`/jobs/${jobId}/candidates?page=${page || 1}&limit=${limit || 50}`),
  
  addCandidate: (jobId: string, candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    skills?: string[];
    experienceYears?: number;
    educationLevel?: string;
    currentPosition?: string;
    resumeUrl?: string;
  }) => request(`/jobs/${jobId}/candidates`, { method: 'POST', body: JSON.stringify(candidate) }),
  
  deleteCandidate: (jobId: string, candidateId: string) => 
    request(`/jobs/${jobId}/candidates/${candidateId}`, { method: 'DELETE' }),
  
  updateCandidateStatus: (jobId: string, candidateId: string, status: string) =>
    request(`/jobs/${jobId}/candidates/${candidateId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
  updateCandidate: (jobId: string, candidateId: string, data: any) =>
    request(`/jobs/${jobId}/candidates/${candidateId}`, { method: 'PATCH', body: JSON.stringify(data) }),

uploadCandidates: (jobId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${API_BASE}/jobs/${jobId}/candidates/upload-csv`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        if (res.status === 401) {
          clearAuth();
          window.location.href = '/login';
        }
        const errorData = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed (${res.status})`);
      }
      return res.json();
    }).then(data => data.data || data);
  },
};

// Screening
export const screeningApi = {
  run: (jobId: string, topN: number = 10) => 
    request(`/jobs/${jobId}/screening/run?top=${topN}`, { method: 'POST' }),
  
  getResults: (jobId: string) => 
    request(`/jobs/${jobId}/screening/results`),
  
  preview: (jobId: string) => 
    request(`/jobs/${jobId}/screening/preview`),
  
  getInterviewKit: (jobId: string, candidateId: string) =>
    request(`/jobs/${jobId}/screening/candidates/${candidateId}/interview-kit`),
};

// Team
export const teamApi = {
  getMembers: () => request('/team'),
  
  invite: (email: string, role: string) =>
    request('/team/invite', { method: 'POST', body: JSON.stringify({ email, role }) }),
  
  updateRole: (userId: string, role: string) =>
    request(`/team/${userId}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  
  remove: (userId: string) =>
    request(`/team/${userId}`, { method: 'DELETE' }),
};

// Notifications
export const notificationsApi = {
  getAll: () => request('/notifications'),
  
  create: (message: string, type?: string, title?: string) =>
    request('/notifications', { method: 'POST', body: JSON.stringify({ message, type, title }) }),
  
  markAsRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'POST' }),
  
  markAllAsRead: () =>
    request('/notifications/read-all', { method: 'POST' }),
};

// Activity
export const activityApi = {
  getAll: (page?: number) => request(`/activity?page=${page || 1}`),
  create: (action: string, target: string, details?: any) =>
    request('/activity', { method: 'POST', body: JSON.stringify({ action, target, details }) }),
};

// Billing
export const billingApi = {
  getPlan: () => request('/billing'),
  
  getInvoices: () => request('/billing/invoices'),
  
  updatePlan: (planId: string) =>
    request('/billing/upgrade', { method: 'POST', body: JSON.stringify({ plan: planId }) }),
};

// AI Chat
export const aiChatApi = {
  chat: (question: string, jobId?: string) =>
    request('/ai/chat', { method: 'POST', body: JSON.stringify({ question, jobId }) }),
  
  getHistory: (jobId: string) =>
    request(`/ai/chat/${jobId}`),
  
  parseFilter: (query: string) =>
    request('/ai/parse-filter', { method: 'POST', body: JSON.stringify({ query }) }),
};

// Insights - aggregated data with caching
const insightsCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 30000; // 30 seconds cache

const getCached = (key: string) => {
  const cached = insightsCache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCached = (key: string, data: any) => {
  insightsCache[key] = { data, timestamp: Date.now() };
};

export const insightsApi = {
  getStats: async () => {
    const cacheKey = 'stats';
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const res: any = await jobsApi.getAll();
    const jobs = Array.isArray(res) ? res : (res?.data || []);
    
    const totalJobs = jobs.length;
    
    // Fetch actual candidate counts for each job in parallel
    const candidatePromises = jobs.map(job => 
      jobsApi.getCandidates(job.id).catch(() => ({ data: [] }))
    );
    const candidateResults = await Promise.all(candidatePromises);
    const totalCandidates = candidateResults.reduce((sum, cands: any) => {
      return sum + (Array.isArray(cands) ? cands.length : (cands?.data?.length || 0));
    }, 0);
    
    // Count actual screening sessions and get avg score in parallel
    let screeningsRun = 0;
    let totalScore = 0;
    let scoreCount = 0;
    
    const screeningPromises = jobs.map(job => screeningApi.getResults(job.id));
    const screeningResults = await Promise.all(screeningPromises);
    
    screeningResults.forEach((res: any) => {
      const results = Array.isArray(res) ? res : (res?.data || []);
      if (results.length > 0) {
        screeningsRun++;
        results.forEach((r: any) => {
          const score = parseFloat(r.score || 0);
          if (score > 0) {
            totalScore += score;
            scoreCount++;
          }
        });
      }
    });
    
    const avgMatch = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const result = { totalJobs, totalCandidates, screeningsRun, avgMatch };
    setCached(cacheKey, result);
    return result;
  },
  
  getScreeningActivity: async () => {
    const cacheKey = 'activity';
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const res: any = await jobsApi.getAll();
    const jobs = Array.isArray(res) ? res : (res?.data || []);
    
    // Get all screening results in parallel
    const screeningPromises = jobs.map(job => screeningApi.getResults(job.id));
    const allResults = await Promise.all(screeningPromises);
    const now = new Date();
    
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let screenings = 0;
      allResults.forEach((res: any) => {
        const resultsArr = Array.isArray(res) ? res : (res?.data || []);
        resultsArr.forEach((r: any) => {
          const screenedDate = r.screenedAt || r.createdAt;
          if (screenedDate && (screenedDate.startsWith(dateStr) || new Date(screenedDate).toDateString() === date.toDateString())) {
            screenings++;
          }
        });
      });
      
      days.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        screenings: screenings,
      });
    }
    setCached(cacheKey, days);
    return days;
  },
  
  getScoreDistribution: async () => {
    const cacheKey = 'scores';
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const res: any = await jobsApi.getAll();
    const jobs = Array.isArray(res) ? res : (res?.data || []);
    
    let high = 0, mid = 0, low = 0;
    
    // Get all screening results in parallel
    const screeningPromises = jobs.map(job => screeningApi.getResults(job.id));
    const allResults = await Promise.all(screeningPromises);
    
    allResults.forEach((res: any) => {
      const results = Array.isArray(res) ? res : (res?.data || []);
      results.forEach((r: any) => {
        const score = parseFloat(r.score || 0);
        if (score >= 85) high++;
        else if (score >= 60) mid++;
        else if (score > 0) low++;
      });
    });
    
    const result = [
      { name: '85%+', value: high, color: '#22c55e' },
      { name: '60-84%', value: mid, color: '#eab308' },
      { name: '<60%', value: low, color: '#ef4444' },
    ];
    setCached(cacheKey, result);
    return result;
  },
  
  getTopSkills: async () => {
    const res: any = await jobsApi.getAll();
    const jobs = Array.isArray(res) ? res : (res?.data || []);
    const skillCounts: Record<string, number> = {};
    
    jobs.forEach((j: any) => {
      (j.requiredSkills || []).forEach((s: string) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxCount = sorted[0]?.[1] || 1;
    
    // If no real skills data, return empty
    if (sorted.length === 0) return [];
    
    return sorted.map(([skill, count]) => ({ skill, count, maxCount }));
  },
};