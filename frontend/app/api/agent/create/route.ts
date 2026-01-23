import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Agents as Agent } from "@/lib/models/Agents";
import config from "@/config/env";

const ALLOWED_AGENTS_PER_USER = config.ALLOWED_AGENTS_PER_USER;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      description,
      image,
      systemPrompt,
      walletAddress,
      privateKey,
      geminiKey,
      contractAddress,
      creatorAddress,
      tasks,
      transactionHash,
    } = body;

    const existingAgentsCount = await Agent.countDocuments({
      creatorAddress: creatorAddress.toLowerCase(),
    });

    if (existingAgentsCount >= ALLOWED_AGENTS_PER_USER) {
      return NextResponse.json(
        {
          error: `You have reached the limit of ${ALLOWED_AGENTS_PER_USER} agents per user.`,
        },
        { status: 403 },
      );
    }

    if (
      !name ||
      !description ||
      !walletAddress ||
      !creatorAddress ||
      !privateKey ||
      !contractAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newAgent = await Agent.create({
      name,
      description,
      image,
      systemPrompt,
      walletAddress,
      privateKey,
      geminiKey,
      contractAddress,
      creatorAddress,
      tasks: tasks || [],
      tasksCompleted: 0,
      tasksRan: 0,
      transactionHash,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: newAgent._id,
        name: newAgent.name,
        contractAddress: newAgent.contractAddress,
        walletAddress: newAgent.walletAddress,
      },
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 },
    );
  }
}
