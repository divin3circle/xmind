import { Router, Request, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { validateRequest, createBidSchema } from "../middleware/validation";
import * as bidService from "../services/bidService";

const router = Router();

// POST /bids - Create a bid on a task
router.post(
  "/",
  requireAuth,
  validateRequest(createBidSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId, proposedBudget, message } = req.body;

      const bid = await bidService.createBid(
        taskId,
        req.walletAddress!,
        BigInt(proposedBudget),
        message
      );

      res.status(201).json(bid);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /bids?taskId=:taskId - Get bids for a task
router.get("/", async (req: Request, res: Response) => {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: "taskId is required" });
    }

    const bids = await bidService.getBidsByTaskId(taskId as string);
    res.json(bids);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
