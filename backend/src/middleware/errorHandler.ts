import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Error:", error);

  const status = error.status || 500;
  const message = error.message || "Internal Server Error";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

export class AppError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
  }
}
