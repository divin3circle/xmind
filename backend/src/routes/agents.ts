import { Router, Request, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { reputationContract } from "../config/blockchain";
import * as reputationService from "../services/reputationService";
import * as agentEarningsService from "../services/agentEarningsService";
import { getAgentRegistrationFeeWei } from "../services/feeService";
import { User } from "../models/User";

const router = Router();

// POST /agents/register - Register as agent and pay 45 USDC fee
router.post(
  "/register",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        displayName,
        agentDescription,
        specializations, // ["MarketData", "DeFi"]
        registrationFeeTxHash, // tx hash of 45 USDC transfer to contract
      } = req.body;

      if (!registrationFeeTxHash) {
        return res.status(400).json({
          error: "registrationFeeTxHash required - must pay 45 USDC first",
        });
      }

      // Update/create user
      const user = await User.findOneAndUpdate(
        { walletAddress: req.walletAddress },
        {
          displayName,
          isAgent: true,
          agentSpecializations: specializations,
          agentDescription,
        },
        { upsert: true, new: true }
      );

      // Initialize agent earnings with 45 USDC registration fee paid
      const registrationFeeWei = getAgentRegistrationFeeWei();
      const agentAddress = req.walletAddress!; // Agent address = creator's wallet

      const earnings = await agentEarningsService.initializeAgentEarnings(
        req.walletAddress!,
        displayName,
        agentAddress,
        registrationFeeWei,
        registrationFeeTxHash
      );

      res.status(201).json({
        success: true,
        agentId: earnings._id,
        agentAddress,
        creatorAddress: req.walletAddress,
        user,
        earnings: {
          registrationFeePaid: earnings.registrationFeePaid.toString(),
          registrationFeePaidAt: earnings.registrationPaidAt,
          availableBalance: earnings.availableBalance.toString(),
        },
        message: `✅ Agent "${displayName}" registered! You paid 45 USDC fee. Ready to bid on tasks.`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /agents - List all agents
router.get("/", async (req: Request, res: Response) => {
  try {
    const { specialization, minReputation = 0, limit = 20 } = req.query;

    let query: any = { isAgent: true };
    if (specialization) {
      query.agentSpecializations = specialization;
    }

    const agents = await User.find(query)
      .limit(parseInt(limit as string))
      .sort({ createdAt: -1 });

    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /agents/:address - Get agent profile and earnings
router.get("/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    const reputation = await reputationService.getAgentReputation(address);
    const earnings = await agentEarningsService.getAgentEarningsSummary(
      address
    );

    if (!user || !user.isAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({
      user,
      reputation: {
        score: reputation.score,
        completedTasks: reputation.completedTasks,
        successfulTasks: reputation.successfulTasks,
        failedTasks: reputation.failedTasks,
      },
      earnings: {
        totalEarned: earnings?.totalEarned.toString() || "0",
        totalWithdrawn: earnings?.totalWithdrawn.toString() || "0",
        availableBalance: earnings?.availableBalance.toString() || "0",
        registrationFeePaid: earnings?.registrationFeePaid.toString() || "0",
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /agents/:address/earnings - Get agent earnings summary (auth required)
router.get(
  "/:address/earnings",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { address } = req.params;

      // Only agent can view their own earnings
      if (address.toLowerCase() !== req.walletAddress?.toLowerCase()) {
        return res.status(403).json({
          error: "Can only view your own earnings",
        });
      }

      const earnings = await agentEarningsService.getAgentEarningsSummary(
        address
      );

      if (!earnings) {
        return res.status(404).json({ error: "No earnings account found" });
      }

      res.json({
        agentAddress: earnings.agentAddress,
        totalEarned: earnings.totalEarned.toString(),
        totalWithdrawn: earnings.totalWithdrawn.toString(),
        availableBalance: earnings.availableBalance.toString(),
        registrationFeePaid: earnings.registrationFeePaid.toString(),
        registrationPaidAt: earnings.registrationPaidAt,
        lastWithdrawalAt: earnings.lastWithdrawalAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /agents/:address/withdraw - Withdraw earnings (auth required)
// DEPRECATED: Use /creators/:address/agents/:agentAddress/withdraw instead
router.post(
  "/:address/withdraw",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      res.status(410).json({
        error:
          "Endpoint deprecated. Use POST /creators/{address}/agents/{agentAddress}/withdraw",
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /agents/:address/withdrawal-history - Get withdrawal history (auth required)
router.get(
  "/:address/withdrawal-history",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { address } = req.params;

      // Only agent can view their own history
      if (address.toLowerCase() !== req.walletAddress?.toLowerCase()) {
        return res.status(403).json({
          error: "Can only view your own withdrawal history",
        });
      }

      const history = await agentEarningsService.getAgentWithdrawalHistory(
        address
      );

      res.json(
        history.map((w) => ({
          amount: w.amount.toString(),
          txHash: w.txHash,
          withdrawnAt: w.withdrawnAt,
        }))
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
