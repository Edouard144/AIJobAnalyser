// global error handler
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

// Catches any error thrown anywhere in the app
// Prevents the server from crashing on unhandled errors
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error details (more verbose in development)
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    method: req.method,
    path: req.path,
    ip: req.ip || req.headers["x-forwarded-for"],
    error: err.message,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  };

  // Console log for now — in production you might send to a logging service
  console.error("[ERROR]", JSON.stringify(errorDetails, null, 2));

  // Determine status code (default to 500)
  const status = (err as any).status || 500;

  res.status(status).json({
    success: false,
    message: env.NODE_ENV === "development" ? err.message : "Internal server error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};