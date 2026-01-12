import { Router, Request, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { validateRequest, createProofSchema } from "../middleware/validation";
import * as proofService from "../services/proofService";
import { verifyProofWithGemini } from "../services/geminiService";
import { uploadProofToIPFS } from "../services/ipfsService";

const router = Router();

// POST /proofs - Upload and create a proof
router.post(
  "/",
  requireAuth,
  validateRequest(createProofSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId, proofType, proofContent } = req.body;

      // Convert string content to buffer
      const fileBuffer = Buffer.from(proofContent, "utf-8");

      // Upload to IPFS
      const proofUrl = await uploadProofToIPFS(
        fileBuffer,
        `proof-${taskId}-${Date.now()}`,
        taskId,
        proofType
      );

      // Create proof record
      const proof = await proofService.createProof(
        taskId,
        req.walletAddress!,
        proofUrl,
        proofType
      );

      res.status(201).json(proof);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /proofs?taskId=:taskId - Get proofs for a task
router.get("/", async (req: Request, res: Response) => {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: "taskId is required" });
    }

    const proofs = await proofService.getProofsByTaskId(taskId as string);
    res.json(proofs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /proofs/:id/verify - Verify proof with Gemini
router.post("/:id/verify", async (req: Request, res: Response) => {
  try {
    const { proofContent, taskDescription } = req.body;
    const proofId = req.params.id;

    const result = await verifyProofWithGemini(
      proofContent,
      "TextReport",
      taskDescription
    );

    const updatedProof = await proofService.updateProofWithGeminiResult(
      proofId,
      result
    );

    res.json(updatedProof);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
