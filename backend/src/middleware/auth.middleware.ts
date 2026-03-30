// JWT verification
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";

// Extend Express Request so req.user is available in controllers
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

// Attach this to any route that requires login
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // now available in all downstream controllers
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};