// auth controller
import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const authController = {

  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, "Account created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, "Login successful");
    } catch (err: any) {
      sendError(res, err.message, 401);
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      sendSuccess(res, result, "Token refreshed");
    } catch {
      sendError(res, "Invalid refresh token", 401);
    }
  },

  // Protected route — test that auth middleware works
  async me(req: Request, res: Response) {
    sendSuccess(res, { userId: req.user?.userId }, "Authenticated");
  },
};