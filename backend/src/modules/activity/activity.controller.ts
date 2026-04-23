// activity controller
import { Request, Response } from "express";
import { activityService } from "./activity.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const activityController = {
  
  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      
      const result = await activityService.getAll(page, limit);
      sendSuccess(res, result, "Activity log fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async getMy(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      
      const result = await activityService.getByUser(req.user!.userId, page, limit);
      sendSuccess(res, result, "My activity fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { action, target, details, description } = req.body;
      if (!action || !target) {
        sendError(res, "action and target are required", 400);
        return;
      }
      const log = await activityService.log(req.user!.userId, action, target, details, description);
      sendSuccess(res, log, "Activity logged", 201);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
};