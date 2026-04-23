-- Performance indexes for AIRECRUIT

-- Jobs: Index on recruiterId (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);

-- Jobs: Index on status
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Jobs: Composite index for recruiter's jobs ordered by date
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_created ON jobs(recruiter_id, created_at DESC);

-- Candidates: Index on jobId (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);

-- Candidates: Index on status
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);

-- Candidates: Composite index for job candidates ordered by date
CREATE INDEX IF NOT EXISTS idx_candidates_job_created ON candidates(job_id, created_at DESC);

-- Screening Results: Index on jobId
CREATE INDEX IF NOT EXISTS idx_screening_job_id ON screening_results(job_id);

-- Screening Results: Index on candidateId
CREATE INDEX IF NOT EXISTS idx_screening_candidate_id ON screening_results(candidate_id);

-- Screening Results: Composite index for job's results ordered by rank
CREATE INDEX IF NOT EXISTS idx_screening_job_rank ON screening_results(job_id, rank);

-- Activity: Index on userId and createdAt
CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity(user_id, created_at DESC);

-- Notifications: Index on userId and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);