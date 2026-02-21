import dbConnect from "@/lib/db/mongodb";
import { AgentAction } from "@/lib/models/AgentAction";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress"); // To filter by user's agents
  const agentId = searchParams.get("agentId"); // To filter by a specific agent

  let query: any = {};

  if (agentId) {
    query.agentId = agentId;
  } else if (walletAddress) {
    // In a real app we'd join with VaultAgent to find agents owned by this wallet
    // but for now let's assume we want to see all actions if no agentId is provided
    // or we could skip filtering.
  }

  try {
    const actions = await AgentAction.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      actions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch actions" },
      { status: 500 },
    );
  }
}
