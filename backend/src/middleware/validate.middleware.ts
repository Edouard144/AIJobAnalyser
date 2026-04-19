// zod validation middleware
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Wraps any Zod schema into a middleware
// Use it on any route to reject bad input before it touches the DB
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    // We try to validate against query if it's a GET, or body otherwise.
    // To be most flexible, we can check where the data actually resides.
    const dataToValidate = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Merge validated data back into the request
    // If we validated query params, we update req.query
    if (Object.keys(req.query).length > 0) {
      req.query = { ...req.query, ...(result.data as any) };
    }
    
    // Always update req.body for POST/PATCH/PUT
    req.body = result.data;
    
    next();
  };