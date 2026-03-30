// zod validation middleware
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Wraps any Zod schema into a middleware
// Use it on any route to reject bad input before it touches the DB
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors, // clear per-field errors
      });
      return;
    }

    req.body = result.data; // replace body with clean validated data
    next();
  };