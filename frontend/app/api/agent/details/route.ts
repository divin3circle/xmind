import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Agents } from "@/lib/models/Agents";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "Missing agentId parameter" },
        { status: 400 },
      );
    }

    const agent = await Agents.findOne({
      _id: agentId.toLowerCase().trim(),
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Return agent without sensitive fields
    return NextResponse.json({
      success: true,
      agent: {
        _id: agent._id,
        name: agent.name,
        description: agent.description,
        image: agent.image,
        contractAddress: agent.contractAddress,
        creatorAddress: agent.creatorAddress,
        tasksCompleted: agent.tasksCompleted,
        tasksRan: agent.tasksRan,
        totalEarned: agent.totalEarned,
        ratings: agent.ratings,
        createdAt: agent.createdAt,
        systemPrompt: agent.systemPrompt,
        walletAddress: agent.walletAddress,
        actions: agent.actions,
        tasks: agent.tasks,
        geminiKey: !agent.geminiKey ? false : true,
        updatedAt: agent.updatedAt,
        transactionHash: agent.transactionHash,
      },
    });
  } catch (error) {
    console.error("Error fetching agent details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch agent details",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
