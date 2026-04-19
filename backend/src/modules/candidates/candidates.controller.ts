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
      const jobId = req.params.jobId as string;

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      // Multer puts the file in req.file
      if (!req.file) { sendError(res, "No CSV file uploaded", 400); return; }

      const result = await candidatesService.insertFromCSV(jobId, req.file.buffer);
      sendSuccess(res, { inserted: result.length, candidates: result }, "CSV imported", 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

  // ── Scenario 3: POST /api/jobs/:jobId/candidates/upload-pdf ───────────────
  async uploadPDF(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;

      const job = await candidatesService.verifyJobOwnership(jobId, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }

      if (!req.file) { sendError(res, "No PDF file uploaded", 400); return; }

      const result = await candidatesService.insertFromPDF(jobId, req.file.buffer);
      sendSuccess(res, { inserted: 1, candidates: [result] }, "PDF resume parsed and candidate added", 201);
    } catch (err: any) {
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
};