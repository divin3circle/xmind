import dbConnect from "@/lib/db/mongodb";
import { VaultAgent } from "@/lib/models/VaultAgent";
import { AgentAction, ActionType, ActionStatus } from "@/lib/models/AgentAction";

type LogActionBody = {
  vaultAddress: string;
  action: string;
  summary: string;
  status: "success" | "skipped" | "error";
  txHash?: string;
};

/**
 * POST /api/cre/log-action
 *
 * Receives execution logs from the Chainlink CRE workflow and stores them
 * in MongoDB as AgentAction records so they appear in the frontend history view.
 */
export async function POST(request: Request) {
  let body: LogActionBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { vaultAddress, action, summary, status, txHash } = body;

  if (!vaultAddress || !action || !summary || !status) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await dbConnect();

    const agent = await VaultAgent.findOne({ vaultAddress: vaultAddress.toLowerCase() });
    if (!agent) {
      return Response.json({ error: "Agent not found for vault address" }, { status: 404 });
    }

    // Map the trigger reason to the closest ActionType enum value
    const actionTypeMap: Record<string, ActionType> = {
      cron: ActionType.REBALANCE,
      deposit: ActionType.SWAP,
      withdrawal: ActionType.HOLD,
      emergency: ActionType.HOLD,
    };

    const actionType = actionTypeMap[action] ?? ActionType.REBALANCE;

    // Map outcome status to ActionStatus
    const actionStatusMap: Record<string, ActionStatus> = {
      success: txHash ? ActionStatus.CONFIRMED : ActionStatus.SUBMITTED,
      skipped: ActionStatus.PLANNED,
      error: ActionStatus.FAILED,
    };

    const record = new AgentAction({
      agentId: agent._id,
      actionType,
      reasoning: summary,
      confidenceScore: status === "success" ? 80 : 30, // Placeholder; Gemini could return this
      proposedTx: { trigger: action, summary },
      txHash: txHash?.toLowerCase(),
      status: actionStatusMap[status] ?? ActionStatus.SUBMITTED,
      executedAt: txHash ? new Date() : undefined,
    });

    await record.save();

    // Update last action time on the agent
    await VaultAgent.updateOne({ _id: agent._id }, { lastAgentActionAt: new Date() });

    return Response.json({ ok: true, actionId: record._id });
  } catch (error) {
    console.error("[CRE] log-action error:", error);
    return Response.json(
      { error: "Failed to log action", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
