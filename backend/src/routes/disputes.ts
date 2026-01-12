import { Router, Request, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import * as disputeService from "../services/disputeService";

const router = Router();

// POST /disputes - Initiate a dispute
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, reason } = req.body;

    if (!taskId || !reason) {
      return res.status(400).json({ error: "taskId and reason are required" });
    }

    const dispute = await disputeService.initiateDispute(
      taskId,
      req.walletAddress!,
      reason
    );

    res.status(201).json(dispute);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /disputes?taskId=:taskId - Get disputes for a task
router.get("/", async (req: Request, res: Response) => {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: "taskId is required" });
    }

    const disputes = await disputeService.getDisputesByTaskId(taskId as string);
    res.json(disputes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /disputes/open - Get all open disputes (admin only)
router.get("/open", async (req: Request, res: Response) => {
  try {
    const disputes = await disputeService.getOpenDisputes();
    res.json(disputes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
