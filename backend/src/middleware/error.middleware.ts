// global error handler
import { Request, Response, NextFunction } from "express";

// Catches any error thrown anywhere in the app
// Prevents the server from crashing on unhandled errors
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};