// AI chat controller
import { Request, Response } from "express";
import { aiChatService } from "./ai.chat.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const aiChatController = {
  
  async chat(req: Request, res: Response) {
    try {
      const { question, jobId } = req.body;
      if (!question) {
        sendError(res, "Question is required", 400);
        return;
      }
      
      const result = await aiChatService.chat(req.user!.userId, jobId || null, question);
      sendSuccess(res, result, "Chat response");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async getHistory(req: Request, res: Response) {
    try {
      const jobId = req.params.jobId as string;
      const messages = await aiChatService.getHistory(req.user!.userId, jobId);
      sendSuccess(res, { messages }, "Chat history");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async parseFilter(req: Request, res: Response) {
    try {
      const { query } = req.body;
      if (!query) {
        sendError(res, "Query is required", 400);
        return;
      }
      
      const filters = await aiChatService.parseFilter(query);
      sendSuccess(res, filters, "Parsed filters");
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
};