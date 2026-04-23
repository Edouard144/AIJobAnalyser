// billing controller
import { Request, Response } from "express";
import { billingService } from "./billing.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const billingController = {
  
  async getBilling(req: Request, res: Response) {
    try {
      const billing = await billingService.getBilling(req.user!.userId);
      if (!billing) {
        sendError(res, "User not found", 404);
        return;
      }
      sendSuccess(res, billing, "Billing info fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  async getInvoices(req: Request, res: Response) {
    try {
      const invoices = await billingService.getInvoices(req.user!.userId);
      sendSuccess(res, invoices, "Invoices fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async upgrade(req: Request, res: Response) {
    try {
      const { plan } = req.body;
      if (!plan) {
        sendError(res, "Plan is required", 400);
        return;
      }
      
      const result = await billingService.upgrade(req.user!.userId, plan);
      sendSuccess(res, result, "Plan upgraded successfully");
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
};