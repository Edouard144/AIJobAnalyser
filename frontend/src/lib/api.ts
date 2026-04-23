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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
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
    }).then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          clearAuth();
          window.location.href = '/login';
        }
        return res.json().then(err => { throw new Error(err.message || 'Upload failed'); });
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

// Insights - aggregated data
export const insightsApi = {
  getStats: async () => {
    const res: any = await jobsApi.getAll();
    const jobs = Array.isArray(res) ? res : (res?.data || []);
    
    const totalJobs = jobs.length;
    
    // Fetch actual candidate counts for each job
    let totalCandidates = 0;
    for (const job of jobs) {
      try {
        const cands: any = await jobsApi.getCandidates(job.id);
        const count = Array.isArray(cands) ? cands.length : (cands?.data?.length || 0);
        totalCandidates += count;
      } catch {}
    }
    
    // Count actual screening sessions (jobs that have screening results)
    let screeningsRun = 0;
    
    // Get all screening results for avg score and count
    let totalScore = 0;
    let scoreCount = 0;
    
    for (const job of jobs) {
      try {
        const res: any = await screeningApi.getResults(job.id);
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
      } catch {}
    }
    
    const avgMatch = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    
    return { totalJobs, totalCandidates, screeningsRun, avgMatch };
  },
  
  getScreeningActivity: async () => {
    const res: any = await jobsApi.getAll();
    const jobs = Array.isArray(res) ? res : (res?.data || []);
    
    // Get screening activity for last 7 days from real screening results
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count screenings done that day from screening results createdAt
      let screenings = 0;
      for (const job of jobs) {
        try {
          const results: any = await screeningApi.getResults(job.id);
          const resultsArr: any[] = Array.isArray(results) ? results : (results?.data || []);
          if (resultsArr.length > 0) {
            const dayCount = resultsArr.filter((r: any) => {
              const screenedDate = r.screenedAt || r.createdAt;
              if (!screenedDate) return false;
              return screenedDate.startsWith(dateStr) || new Date(screenedDate).toDateString() === date.toDateString();
            }).length;
            screenings += dayCount;
          }
        } catch {}
      }
      
      days.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        screenings: screenings,
      });
    }
    return days;
  },
  
  getScoreDistribution: async () => {
    const res: any = await jobsApi.getAll();
    const jobs = Array.isArray(res) ? res : (res?.data || []);
    
    let high = 0, mid = 0, low = 0;
    
    for (const job of jobs) {
      try {
        const res: any = await screeningApi.getResults(job.id);
        const results = Array.isArray(res) ? res : (res?.data || []);
        if (results.length > 0) {
          results.forEach((r: any) => {
            const score = parseFloat(r.score || 0);
            if (score >= 85) high++;
            else if (score >= 60) mid++;
            else if (score > 0) low++;
          });
        }
      } catch {}
    }
    
    return [
      { name: '85%+', value: high, color: '#22c55e' },
      { name: '60-84%', value: mid, color: '#eab308' },
      { name: '<60%', value: low, color: '#ef4444' },
    ];
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