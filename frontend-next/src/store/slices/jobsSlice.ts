import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobsService, type Job as ApiJob } from '@/services/jobs.service';
import { candidatesService, type Candidate as ApiCandidate } from '@/services/candidates.service';
import { screeningService, type ScreeningResult as ApiScreeningResult } from '@/services/screening.service';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: number;
  education: string;
  source: 'Umurava' | 'External';
  addedAt: string;
  position?: string;
}

export interface ScreeningResult {
  candidateId: string;
  candidateName: string;
  position: string;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  shortlisted: boolean;
  whyNot?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  status: 'open' | 'screening' | 'closed';
  skills: string[];
  experience: number;
  education: string;
  candidates: Candidate[];
  results: ScreeningResult[];
  createdAt: string;
}

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  loading: false,
  error: null,
};

// Converters
function convertApiCandidate(apiCandidate: ApiCandidate): Candidate {
  return {
    id: apiCandidate.id,
    name: apiCandidate.fullName,
    email: apiCandidate.email || '',
    skills: apiCandidate.skills,
    experience: apiCandidate.experienceYears,
    education: apiCandidate.educationLevel || 'any',
    source: apiCandidate.source === 'umurava' ? 'Umurava' : 'External',
    addedAt: apiCandidate.createdAt,
    position: apiCandidate.currentPosition || undefined,
  };
}

function convertApiScreeningResult(apiResult: ApiScreeningResult): ScreeningResult {
  return {
    candidateId: apiResult.candidate.id,
    candidateName: apiResult.candidate.fullName,
    position: apiResult.candidate.currentPosition || 'Candidate',
    rank: apiResult.rank,
    score: parseFloat(apiResult.score),
    strengths: apiResult.strengths,
    gaps: apiResult.gaps,
    recommendation: apiResult.recommendation,
    shortlisted: false,
    whyNot: apiResult.gaps.length > 0 ? apiResult.gaps.join(', ') : undefined,
  };
}

// Thunks
export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return rejectWithValue('No token provided');

    const response = await jobsService.getAll() as any;
    const apiJobs = response.data || [];
    const jobsWithDetails = await Promise.all(
      apiJobs.map(async (apiJob: any) => {
      try {
        const [apiCandidates, apiResults] = await Promise.all([
          candidatesService.getByJob(apiJob.id).catch(() => []),
          screeningService.getResults(apiJob.id).catch(() => []),
        ]);
        
        const candidates = apiCandidates.map(convertApiCandidate);
        const results = apiResults.map(convertApiScreeningResult);
        
        const shortlistedCount = Math.min(10, results.length);
        const resultsWithShortlist = results.map((r, i) => ({
          ...r,
          shortlisted: i < shortlistedCount,
        }));
        
        return {
          id: apiJob.id,
          title: apiJob.title,
          description: apiJob.description || '',
          location: apiJob.location,
          status: apiJob.status,
          skills: apiJob.requiredSkills || [],
          experience: apiJob.experienceYears || 0,
          education: apiJob.educationLevel || 'any',
          candidates,
          results: resultsWithShortlist,
          createdAt: apiJob.createdAt,
        };
      } catch {
        return {
          id: apiJob.id,
          title: apiJob.title,
          description: apiJob.description || '',
          location: apiJob.location,
          status: apiJob.status,
          skills: apiJob.requiredSkills || [],
          experience: apiJob.experienceYears || 0,
          education: apiJob.educationLevel || 'any',
          candidates: [],
          results: [],
          createdAt: apiJob.createdAt,
        };
      }
    })
  );
    return jobsWithDetails;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch jobs');
  }
});

export const addJob = createAsyncThunk('jobs/add', async (data: any) => {
  const apiJob = await jobsService.create(data);
  return {
    id: apiJob.id,
    title: apiJob.title,
    description: apiJob.description || '',
    location: apiJob.location,
    status: apiJob.status,
    skills: apiJob.requiredSkills || [],
    experience: apiJob.experienceYears || 0,
    education: apiJob.educationLevel || 'any',
    candidates: [],
    results: [],
    createdAt: apiJob.createdAt,
  };
});

export const updateJob = createAsyncThunk('jobs/update', async ({ id, data }: { id: string, data: any }) => {
  const apiJob = await jobsService.update(id, data);
  return apiJob; 
});

export const addCandidatesAction = createAsyncThunk('jobs/addCandidates', async ({ jobId, candidates }: { jobId: string, candidates: any[] }) => {
  const response = await candidatesService.bulkInsert(jobId, candidates);
  return { jobId, candidates: response.candidates.map(convertApiCandidate) };
});

export const uploadCsvAction = createAsyncThunk('jobs/uploadCsv', async ({ jobId, file }: { jobId: string, file: File }) => {
  const response = await candidatesService.uploadCsv(jobId, file);
  return { jobId, candidates: response.candidates.map(convertApiCandidate) };
});

export const uploadPdfAction = createAsyncThunk('jobs/uploadPdf', async ({ jobId, file }: { jobId: string, file: File }) => {
  // We will implement this endpoint in the backend later
  const response = await candidatesService.uploadPdf(jobId, file);
  return { jobId, candidates: response.candidates.map(convertApiCandidate) };
});

export const runScreeningAction = createAsyncThunk('jobs/runScreening', async ({ jobId, topN }: { jobId: string, topN: number }) => {
  const response = await screeningService.run(jobId, topN);
  const results = response.results.map(convertApiScreeningResult);
  const resultsWithShortlist = results.map((r, i) => ({
    ...r,
    shortlisted: i < topN,
  }));
  return { jobId, results: resultsWithShortlist };
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobs = action.payload;
        state.loading = false;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      .addCase(addJob.fulfilled, (state, action) => {
        state.jobs.push(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(j => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = { ...state.jobs[index], ...action.payload };
        }
      })
      .addCase(addCandidatesAction.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j.id === action.payload.jobId);
        if (job) {
          job.candidates.push(...action.payload.candidates);
        }
      })
      .addCase(uploadCsvAction.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j.id === action.payload.jobId);
        if (job) {
          job.candidates.push(...action.payload.candidates);
        }
      })
      .addCase(uploadPdfAction.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j.id === action.payload.jobId);
        if (job) {
          job.candidates.push(...action.payload.candidates);
        }
      })
      .addCase(runScreeningAction.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j.id === action.payload.jobId);
        if (job) {
          job.results = action.payload.results;
          job.status = 'screening';
        }
      });
  },
});

export default jobsSlice.reducer;
