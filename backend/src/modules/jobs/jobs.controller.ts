import { Request, Response } from "express";
import { jobsService } from "./jobs.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const jobsController = {

  async create(req: Request, res: Response) {
    try {
      const job = await jobsService.create(req.user!.userId, req.body);
      sendSuccess(res, job, "Job created", 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const jobs = await jobsService.getAll(req.user!.userId);
      sendSuccess(res, jobs, "Jobs fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const id = req.params.id as string; 
      const job = await jobsService.getOne(id, req.user!.userId);
      if (!job) { sendError(res, "Job not found", 404); return; }
      sendSuccess(res, job, "Job fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;  
      const job = await jobsService.update(id, req.user!.userId, req.body);
      if (!job) { sendError(res, "Job not found", 404); return; }
      sendSuccess(res, job, "Job updated");
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string; 
      const job = await jobsService.updateStatus(id, req.user!.userId, req.body.status);
      if (!job) { sendError(res, "Job not found", 404); return; }
      sendSuccess(res, job, "Job status updated");
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id as string;   // ← cast here
      const deleted = await jobsService.remove(id, req.user!.userId);
      if (!deleted) { sendError(res, "Job not found", 404); return; }
      sendSuccess(res, deleted, "Job deleted");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
};