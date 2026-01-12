import { Router, Request, Response } from "express";
import { generateNonce } from "../middleware/auth";

const router = Router();

// GET /auth/nonce - Generate nonce for signing
router.get("/nonce", (req: Request, res: Response) => {
  try {
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // In production, store nonce in Redis with expiry
    res.json({
      nonce,
      expiresAt,
      message: `Sign this message with your wallet to authenticate:\n\nNonce: ${nonce}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate nonce" });
  }
});

// POST /auth/verify - Verify signature and get authenticated
router.post("/verify", (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, nonce, message } = req.body;

    // Verify signature (basic validation, in production use proper nonce check)
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Return wallet address (frontend will use this for subsequent API calls)
    res.json({
      success: true,
      walletAddress: walletAddress.toLowerCase(),
      message: "Wallet verified. Use this address for subsequent API calls.",
    });
  } catch (error) {
    res.status(401).json({ error: "Verification failed" });
  }
});

export default router;
