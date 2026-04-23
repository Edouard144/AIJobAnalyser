// Insights controller
import { Request, Response } from "express";
import { insightsService } from "./insights.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const insightsController = {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await insightsService.getDashboardStats(userId);
      sendSuccess(res, stats, "Dashboard stats fetched");
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  },

  async getScreeningActivity(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const activity = await insightsService.getScreeningActivity(userId);
      sendSuccess(res, activity, "Screening activity fetched");
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  },

  async getScoreDistribution(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const distribution = await insightsService.getScoreDistribution(userId);
      sendSuccess(res, distribution, "Score distribution fetched");
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  },

  async getTopSkills(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const skills = await insightsService.getTopSkills(userId);
      sendSuccess(res, skills, "Top skills fetched");
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  },
};
