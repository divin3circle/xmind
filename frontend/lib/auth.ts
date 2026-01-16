import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

export function generateNonce(): string {
  return ethers.id(Math.random().toString()).substring(2, 18);
}

export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!walletAddress || !signature || !message) {
      return { success: false, error: "Missing required fields" };
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return { success: false, error: "Invalid signature" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Signature verification failed" };
  }
}

// Helper to get wallet address from request (if stored in headers/cookies)
export function getWalletFromRequest(req: NextRequest): string | null {
  // Implement based on your auth strategy (JWT, session, etc.)
  const walletAddress = req.headers.get("x-wallet-address");
  return walletAddress;
}
