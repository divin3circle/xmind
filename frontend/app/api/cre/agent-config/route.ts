import dbConnect from "@/lib/db/mongodb";
import { VaultAgent } from "@/lib/models/VaultAgent";
import { NextRequest } from "next/server";

/**
 * GET /api/cre/agent-config?vaultAddress=0x...
 *
 * Returns agent configuration to the Chainlink CRE workflow.
 * This is the bridge between MongoDB and the CRE environment.
 */
export async function GET(request: NextRequest) {
  const vaultAddress = request.nextUrl.searchParams.get("vaultAddress");

  if (!vaultAddress) {
    return Response.json({ error: "vaultAddress is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const agent = await VaultAgent.findOne({ vaultAddress: vaultAddress.toLowerCase() }).lean();

    if (!agent) {
      return Response.json(
        { error: `No agent found for vault address: ${vaultAddress}` },
        { status: 404 }
      );
    }

    return Response.json({
      systemPrompt: agent.systemPrompt,
      riskProfile: agent.riskProfile,
      strategyDescription: agent.strategyDescription,
      tradingEnabled: agent.tradingEnabled,
      maxPositionSizeBps: agent.maxPositionSizeBps,
      maxDailyTradeBps: agent.maxDailyTradeBps,
      rebalanceCooldownSeconds: agent.rebalanceCooldownSeconds,
      lastAgentActionAt: agent.lastAgentActionAt,
    });
  } catch (error) {
    console.error("[CRE] agent-config error:", error);
    return Response.json(
      { error: "Failed to fetch agent config", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
