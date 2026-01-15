import { Router, Request, Response } from "express";
import { generateNonce } from "../middleware/auth";
import { User } from "../models/User";
import { ethers } from "ethers";

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
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Verify required fields
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const lowerWalletAddress = walletAddress.toLowerCase();

    // Find or create user
    let user = await User.findOne({ walletAddress: lowerWalletAddress });

    if (!user) {
      user = new User({
        walletAddress: lowerWalletAddress,
        displayName: `User ${lowerWalletAddress.slice(0, 6)}`,
        isAgent: false,
      });
      await user.save();
    }

    res.json({
      success: true,
      walletAddress: lowerWalletAddress,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        isAgent: user.isAgent,
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(401).json({ error: "Verification failed" });
  }
});

export default router;
