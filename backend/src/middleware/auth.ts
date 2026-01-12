import { Request, Response, NextFunction } from "express";
import { ethers } from "ethers";

export interface AuthRequest extends Request {
  walletAddress?: string;
}

// Generate a nonce for signature challenge
export function generateNonce(): string {
  return ethers.id(Math.random().toString()).substring(2, 18);
}

// Middleware to verify wallet signature
export async function verifyWalletSignature(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      res.status(400).json({
        error: "Missing walletAddress, signature, or message",
      });
      return;
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    req.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    res.status(401).json({ error: "Signature verification failed" });
  }
}

// Middleware to require authentication
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.walletAddress) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}
