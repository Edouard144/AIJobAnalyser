// zod validation middleware
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
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
    
    // Merge validated data back
    if (Object.keys(req.query).length > 0) {
      req.query = { ...req.query, ...(result.data as any) };
    }
    req.body = result.data;
    
    next();
  };