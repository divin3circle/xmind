import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
  };
};

// Common validation schemas
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const createTaskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  budget: z.string().regex(/^\d+$/, "Budget must be a number string"),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const createBidSchema = z.object({
  taskId: z.string(),
  proposedBudget: z.string().regex(/^\d+$/, "Budget must be a number string"),
  message: z.string().optional(),
});

export const createProofSchema = z.object({
  taskId: z.string(),
  proofType: z.enum(["TextReport", "CodeRepo", "Image", "Video", "Dataset"]),
});
