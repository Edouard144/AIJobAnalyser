// team controller
import { Request, Response } from "express";
import { teamService } from "./team.service";
import { sendSuccess, sendError } from "../../utils/response.utils";

export const teamController = {
  
  async getTeam(req: Request, res: Response) {
    try {
      const members = await teamService.getTeam(req.user!.userId);
      sendSuccess(res, { members }, "Team members fetched");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async invite(req: Request, res: Response) {
    try {
      const { email, role } = req.body;
      if (!email) {
        sendError(res, "Email is required", 400);
        return;
      }
      
      const result = await teamService.invite(req.user!.userId, email, role);
      sendSuccess(res, result, "Invite sent");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async updateRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!role) {
        sendError(res, "Role is required", 400);
        return;
      }
      
      const result = await teamService.updateRole(userId, role);
      sendSuccess(res, result, "Role updated");
    } catch (err: any) {
      sendError(res, err.message);
    }
  },
  
  async remove(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await teamService.remove(userId);
      sendSuccess(res, { removed: true }, "Member removed");
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
};