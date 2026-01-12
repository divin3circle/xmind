import { Router, Request, Response } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import * as agentEarningsService from "../services/agentEarningsService";

const router = Router();

// GET /creators/:creatorAddress/agents - List all agents created by this wallet (auth required)
router.get(
  "/:creatorAddress/agents",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { creatorAddress } = req.params;

      // Only creator can view their own agents
      if (creatorAddress.toLowerCase() !== req.walletAddress?.toLowerCase()) {
        return res.status(403).json({
          error: "Can only view your own agents",
        });
      }

      const agents = await agentEarningsService.getCreatorAgents(
        creatorAddress
      );

      res.json(
        agents.map((a) => ({
          agentId: a._id,
          agentName: a.agentName,
          agentAddress: a.agentAddress,
          totalEarned: a.totalEarned.toString(),
          totalWithdrawn: a.totalWithdrawn.toString(),
          availableBalance: a.availableBalance.toString(),
          createdAt: a.createdAt,
        }))
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /creators/:creatorAddress/agents/:agentAddress/earnings - Get specific agent earnings (auth required)
router.get(
  "/:creatorAddress/agents/:agentAddress/earnings",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { creatorAddress, agentAddress } = req.params;

      // Only creator can view their agent's earnings
      if (creatorAddress.toLowerCase() !== req.walletAddress?.toLowerCase()) {
        return res.status(403).json({
          error: "Can only view your own agents' earnings",
        });
      }

      const earnings = await agentEarningsService.getAgentEarningsSummary(
        agentAddress
      );

      if (!earnings) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Verify creator owns this agent
      if (
        earnings.creatorAddress.toLowerCase() !== creatorAddress.toLowerCase()
      ) {
        return res.status(403).json({
          error: "You don't own this agent",
        });
      }

      res.json({
        agentId: earnings._id,
        agentName: earnings.agentName,
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

// POST /creators/:creatorAddress/agents/:agentAddress/withdraw - Withdraw agent earnings (auth required)
// Backend signs transaction with PLATFORM_PRIVATE_KEY and transfers from PLATFORM_WALLET
router.post(
  "/:creatorAddress/agents/:agentAddress/withdraw",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { creatorAddress, agentAddress } = req.params;
      const { amountWei } = req.body;

      // Only creator can withdraw their agent's earnings
      if (creatorAddress.toLowerCase() !== req.walletAddress?.toLowerCase()) {
        return res.status(403).json({
          error: "Can only withdraw from your own agents",
        });
      }

      if (!amountWei) {
        return res.status(400).json({
          error: "amountWei required",
        });
      }

      const { earnings, txHash } =
        await agentEarningsService.withdrawCreatorEarnings(
          creatorAddress,
          agentAddress,
          BigInt(amountWei)
        );

      res.json({
        success: true,
        message: `✅ Withdrew ${amountWei} USDC to your wallet`,
        txHash,
        availableBalance: earnings.availableBalance.toString(),
        totalWithdrawn: earnings.totalWithdrawn.toString(),
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /creators/:creatorAddress/agents/:agentAddress/withdrawal-history - Get withdrawal history (auth required)
router.get(
  "/:creatorAddress/agents/:agentAddress/withdrawal-history",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { creatorAddress, agentAddress } = req.params;

      // Only creator can view their agent's history
      if (creatorAddress.toLowerCase() !== req.walletAddress?.toLowerCase()) {
        return res.status(403).json({
          error: "Can only view your own agents' withdrawal history",
        });
      }

      const history = await agentEarningsService.getAgentWithdrawalHistory(
        agentAddress
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
