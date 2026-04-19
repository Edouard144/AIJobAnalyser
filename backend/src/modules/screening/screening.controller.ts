// screening controller
import { Request, Response } from "express";
import { screeningService } from "./screening.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const screeningController = {

  // POST /api/jobs/:jobId/screening/run?top=10
  async run(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;

      // Allow recruiter to choose top 10 or top 20 via query param
      const topN = parseInt(req.query.top as string) || 10;
      if (topN !== 10 && topN !== 20) {
        sendError(res, "top must be 10 or 20", 400);
        return;
      }

      // This can take a few seconds — Gemini is processing
      const result = await screeningService.runScreening(jobId, topN);

      sendSuccess(res, result, `Screening complete — top ${topN} candidates shortlisted`);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  },

  // GET /api/jobs/:jobId/screening/results
  async getResults(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;
      const results = await screeningService.getResults(jobId);

      if (results.length === 0) {
        sendError(res, "No screening results found. Run screening first.", 404);
        return;
      }

      sendSuccess(res, results, "Screening results fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  // GET /api/jobs/:jobId/screening/candidates/:candidateId/interview-kit
  async generateInterviewKit(req: Request, res: Response) {
    try {
      const { jobId, candidateId } = req.params as { jobId: string; candidateId: string };
      const questions = await screeningService.generateInterviewKit(jobId, candidateId);
      sendSuccess(res, questions, "Interview kit generated successfully");
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  },
};