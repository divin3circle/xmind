import { Request, Response, NextFunction } from "express";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
    return originalSend.call(this, data);
  };

  next();
}
