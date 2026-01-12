import { Router, Request, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { validateRequest, createTaskSchema } from "../middleware/validation";
import * as taskService from "../services/taskService";
import { config } from "../config/env";
import { calculateFees } from "../services/feeService";

const router = Router();

// POST /tasks - Create a new task
router.post(
  "/",
  requireAuth,
  validateRequest(createTaskSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, budget, category, skills } = req.body;

      const task = await taskService.createTask(
        req.walletAddress!,
        title,
        description,
        BigInt(budget),
        config.ESCROW_ADDRESS,
        category,
        skills
      );

      // Calculate and return fee breakdown
      const fees = calculateFees(BigInt(budget));

      res.status(201).json({
        ...JSON.parse(JSON.stringify(task)),
        feeBreakdown: {
          budget: fees.budget.toString(),
          platformFee: fees.platformFee.toString(),
          sdkFee: fees.sdkFee.toString(),
          agentEarnings: fees.agentEarnings.toString(),
          totalFees: fees.totalFees.toString(),
          platformFeePercent: "10%",
          sdkFeePercent: "5%",
          agentEarningsPercent: "85%",
        },
        message: `Task created. Agent will earn ${fees.agentEarnings.toString()} USDC (85% after fees)`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /tasks - List all tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, creator, agent, limit = 20, skip = 0 } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (creator) filters.creatorAddress = creator;
    if (agent) filters.selectedAgentAddress = agent;

    const tasks = await taskService.listTasks(
      filters,
      parseInt(limit as string),
      parseInt(skip as string)
    );

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tasks/:id - Get task details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
