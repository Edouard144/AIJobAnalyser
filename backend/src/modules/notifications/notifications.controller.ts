// notifications controller
import { Request, Response } from "express";
import { notificationsService } from "./notifications.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const notificationsController = {
  
  async get(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      
      const result = await notificationsService.getByUser(req.user!.userId, page, limit);
      sendSuccess(res, result, "Notifications fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async markRead(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await notificationsService.markAsRead(id, req.user!.userId);
      if (!result) {
        sendError(res, "Notification not found", 404);
        return;
      }
      sendSuccess(res, result, "Notification marked as read");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async markAllRead(req: Request, res: Response) {
    try {
      await notificationsService.markAllAsRead(req.user!.userId);
      sendSuccess(res, { success: true }, "All notifications marked as read");
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
};