// standard API response format
import { Response } from "express";

// Every endpoint returns the same shape — clean and predictable for the frontend
export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = "Something went wrong",
  statusCode = 500,
  errors?: unknown
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
  });
};