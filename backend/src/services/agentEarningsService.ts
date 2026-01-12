import { AgentEarnings, IAgentEarnings } from "../models/AgentEarnings";
import { Task } from "../models/Task";
import { ethers } from "ethers";
import config from "../config/env";

const provider = new ethers.JsonRpcProvider(config.CRONOS_TESTNET_RPC);
const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
];

/**
 * Initialize agent earnings account on registration
 */
export async function initializeAgentEarnings(
  creatorAddress: string,
  agentName: string,
  agentAddress: string,
  registrationFeePaidWei: bigint,
  registrationFeeTxHash: string
): Promise<IAgentEarnings> {
  let earnings = await AgentEarnings.findOne({
    agentAddress: agentAddress.toLowerCase(),
  });

  if (!earnings) {
    earnings = new AgentEarnings({
      agentName,
      creatorAddress: creatorAddress.toLowerCase(),
      agentAddress: agentAddress.toLowerCase(),
      registrationFeePaid: registrationFeePaidWei,
      registrationFeePaidTxHash: registrationFeeTxHash,
      registrationPaidAt: new Date(),
    });
  } else {
    earnings.registrationFeePaid = registrationFeePaidWei;
    earnings.registrationFeePaidTxHash = registrationFeeTxHash;
    earnings.registrationPaidAt = new Date();
  }

  return await earnings.save();
}

/**
 * Credit agent earnings when task is released
 */
export async function creditAgentEarnings(
  agentAddress: string,
  taskId: string,
  amountWei: bigint,
  txHash: string
): Promise<IAgentEarnings | null> {
  const earnings = await AgentEarnings.findOne({
    agentAddress: agentAddress.toLowerCase(),
  });

  if (!earnings) {
    throw new Error(`No earnings account for agent ${agentAddress}`);
  }

  earnings.totalEarned += amountWei;
  earnings.availableBalance += amountWei;

  return await earnings.save();
}

/**
 * Process creator withdrawal - transfers funds from platform wallet to creator
 * Platform wallet holds all funds, backend signs withdrawal
 */
export async function withdrawCreatorEarnings(
  creatorAddress: string,
  agentAddress: string,
  amountWei: bigint
): Promise<{ earnings: IAgentEarnings; txHash: string }> {
  const earnings = await AgentEarnings.findOne({
    agentAddress: agentAddress.toLowerCase(),
  });

  if (!earnings) {
    throw new Error(`No earnings account for agent ${agentAddress}`);
  }

  // Verify creator owns this agent
  if (earnings.creatorAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
    throw new Error("Only creator can withdraw agent earnings");
  }

  if (earnings.availableBalance < amountWei) {
    throw new Error(
      `Insufficient balance. Available: ${earnings.availableBalance}, Requested: ${amountWei}`
    );
  }

  // Create signer from PLATFORM_PRIVATE_KEY to transfer USDC
  const wallet = new ethers.Wallet(config.PLATFORM_PRIVATE_KEY, provider);
  const usdcContract = new ethers.Contract(
    config.USDC_ADDRESS,
    USDC_ABI,
    wallet
  );

  try {
    // Transfer USDC from platform wallet to creator
    const tx = await usdcContract.transfer(creatorAddress, amountWei);
    await tx.wait();

    // Update earnings record
    earnings.totalWithdrawn += amountWei;
    earnings.availableBalance -= amountWei;
    earnings.lastWithdrawalAt = new Date();

    earnings.withdrawalHistory.push({
      amount: amountWei,
      txHash: tx.hash,
      withdrawnAt: new Date(),
    });

    await earnings.save();

    return { earnings, txHash: tx.hash };
  } catch (error: any) {
    throw new Error(`Withdrawal failed: ${error.message}`);
  }
}

/**
 * Get all agents created by a creator
 */
export async function getCreatorAgents(
  creatorAddress: string
): Promise<IAgentEarnings[]> {
  return await AgentEarnings.find({
    creatorAddress: creatorAddress.toLowerCase(),
  }).sort({ createdAt: -1 });
}

/**
 * Get agent earnings summary
 */
export async function getAgentEarningsSummary(
  agentAddress: string
): Promise<IAgentEarnings | null> {
  return await AgentEarnings.findOne({
    agentAddress: agentAddress.toLowerCase(),
  });
}

/**
 * Get all withdrawals for an agent
 */
export async function getAgentWithdrawalHistory(agentAddress: string) {
  const earnings = await AgentEarnings.findOne({
    agentAddress: agentAddress.toLowerCase(),
  });

  return earnings?.withdrawalHistory || [];
}
