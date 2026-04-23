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
    try {
      const user = await authService.getProfile(req.user!.userId);
      if (!user) {
        sendError(res, "User not found", 404);
        return;
      }
      sendSuccess(res, user, "Profile fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },

  // Send OTP for email verification
  async sendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        sendError(res, "Email is required", 400);
        return;
      }
      const result = await authService.sendOTP(email);
      sendSuccess(res, result, "OTP sent to email");
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

  // Verify OTP
  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        sendError(res, "Email and OTP are required", 400);
        return;
      }
      const result = await authService.verifyOTP(email, otp);
      sendSuccess(res, result, "Email verified successfully");
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  },

  // Update profile (language, theme, onboarding)
  async updateMe(req: Request, res: Response) {
    try {
      const { language, theme, onboardingCompleted } = req.body;
      const result = await authService.updateProfile(req.user!.userId, {
        language,
        theme,
        onboardingCompleted,
      });
      sendSuccess(res, result, "Profile updated");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
};