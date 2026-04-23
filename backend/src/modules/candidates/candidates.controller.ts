// candidates controller
import { Request, Response } from "express";
import { candidatesService } from "./candidates.service";
import { bulkCandidatesSchema } from "./candidates.schema";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const candidatesController = {

  // ── Scenario 1: POST /api/jobs/:jobId/candidates/bulk ─────────────────────
  async bulkInsert(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;

      // Confirm this job belongs to the recruiter
      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      // Validate the array of candidates
      const parsed = bulkCandidatesSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, "Validation failed", 400, parsed.error.flatten().fieldErrors);
        return;
      }

      const result = await candidatesService.bulkInsert(jobId, parsed.data.candidates);
      sendSuccess(res, { inserted: result.length, candidates: result }, "Candidates added", 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

// ── Scenario 2: POST /api/jobs/:jobId/candidates/upload-csv ───────────────
  async uploadCSV(req: Request, res: Response) {
    try {
      console.log('[CSV Upload] Endpoint hit');
      console.log('[CSV Upload] jobId:', req.params.jobId);
      console.log('[CSV Upload] req.file:', req.file ? { name: req.file.originalname, size: req.file.size } : 'NONE');
      
      const jobId = req.params.jobId as string;

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      console.log('[CSV Upload] Job ownership verified:', job ? 'YES' : 'NO');
      if (!job) { sendError(res, "Job not found", 404); return; }

      // Multer puts the file in req.file
      if (!req.file) { 
        console.log('[CSV Upload] No file in request');
        sendError(res, "No CSV file uploaded", 400); return; 
      }

      console.log('[CSV Upload] Parsing CSV...');
      const result = await candidatesService.insertFromCSV(jobId, req.file.buffer);
      console.log('[CSV Upload] Success, inserted:', result.length);
      sendSuccess(res, { inserted: result.length, candidates: result }, "CSV imported", 201);
    } catch (err: any) {
      console.error('[CSV Upload] Error:', err);
      sendError(res, err.message, 400);
    }
  },

  // ── GET /api/jobs/:jobId/candidates ───────────────────────────────────────
  async getByJob(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await candidatesService.getByJob(jobId, page, limit);
      sendSuccess(res, result, "Candidates fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  // ── GET /api/jobs/:jobId/candidates/:id ───────────────────────────────────
  async getOne(req: Request, res: Response) {
    try {
      const { jobId, id } = req.params as { jobId: string; id: string };

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      const candidate = await candidatesService.getOne(id, jobId);
      if (!candidate) { sendError(res, "Candidate not found", 404); return; }

      sendSuccess(res, candidate, "Candidate fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  // ── DELETE /api/jobs/:jobId/candidates/:id ────────────────────────────────
  async remove(req: Request, res: Response) {
    try {
      const { jobId, id } = req.params as { jobId: string; id: string };

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      const deleted = await candidatesService.remove(id, jobId);
      if (!deleted) { sendError(res, "Candidate not found", 404); return; }

      sendSuccess(res, deleted, "Candidate deleted");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

// ── DELETE /api/jobs/:jobId/candidates ────────────────────────────────────
async removeAll(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      await candidatesService.removeAll(jobId);
      sendSuccess(res, null, "All candidates removed");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  // ── POST /api/jobs/:jobId/candidates/recalculate-experience ───────────────
  async recalculateExperience(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      const result = await candidatesService.recalculateExperienceYears(jobId);
      sendSuccess(res, result, "Experience years recalculated");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { jobId, id } = req.params as { jobId: string; id: string };
      const { status } = req.body;

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }
      if (!status) { sendError(res, "Status is required", 400); return; }

      const updated = await candidatesService.updateStatus(id, status);
      if (!updated) { sendError(res, "Candidate not found", 404); return; }

      sendSuccess(res, updated, "Candidate status updated");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { jobId, id } = req.params as { jobId: string; id: string };

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      const updated = await candidatesService.update(id, req.body);
      if (!updated) { sendError(res, "Candidate not found", 404); return; }

      sendSuccess(res, updated, "Candidate updated");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
};