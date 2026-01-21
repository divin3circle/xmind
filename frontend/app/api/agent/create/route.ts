import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Agents as Agent } from "@/lib/models/Agents";
import Cryptr from "cryptr";
import config from "@/config/env";

const cryptr = new Cryptr(config.ENCRYPTION_KEY);

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

    if (!name || !description || !walletAddress || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const encryptedPrivateKey = cryptr.encrypt(privateKey);
    const encryptedGeminiKey = geminiKey
      ? cryptr.encrypt(geminiKey)
      : undefined;
    const newAgent = await Agent.create({
      name,
      description,
      image,
      systemPrompt,
      walletAddress,
      encryptedPrivateKey,
      encryptedGeminiKey,
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
