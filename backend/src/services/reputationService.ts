import { reputationContract } from "../config/blockchain";
import { AgentReputation } from "../models/AgentReputation";

export async function getAgentReputation(agentAddress: string) {
  try {
    const onchainScore = await reputationContract.getScore(agentAddress);

    let reputation = await AgentReputation.findOne({
      agentAddress: agentAddress.toLowerCase(),
    });

    if (!reputation) {
      reputation = new AgentReputation({
        agentAddress: agentAddress.toLowerCase(),
        score: Number(onchainScore),
        onchainLastUpdate: new Date(),
      });
      await reputation.save();
    } else {
      reputation.score = Number(onchainScore);
      reputation.onchainLastUpdate = new Date();
      await reputation.save();
    }

    return reputation;
  } catch (error) {
    console.error("Failed to get agent reputation:", error);
    throw error;
  }
}

export async function updateAgentStats(
  agentAddress: string,
  stats: Partial<{
    completedTasks: number;
    successfulTasks: number;
    failedTasks: number;
    disputes: number;
    totalEarnings: bigint;
  }>
) {
  return await AgentReputation.findOneAndUpdate(
    { agentAddress: agentAddress.toLowerCase() },
    { ...stats, lastUpdatedAt: new Date() },
    { new: true, upsert: true }
  );
}
