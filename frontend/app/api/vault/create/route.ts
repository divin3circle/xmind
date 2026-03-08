import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { VaultAgent } from "@/lib/models/VaultAgent";
import config from "@/config/env";

const ALLOWED_AGENTS_PER_USER = config.ALLOWED_AGENTS_PER_USER || 10;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      description,
      image,
      systemPrompt,
      strategyDescription,
      riskProfile,
      vaultAddress,
      creatorAddress,
      underlyingToken,
      chainId,
      transactionHash,
    } = body;

    const existingVaultsCount = await VaultAgent.countDocuments({
      creatorAddress: creatorAddress.toLowerCase(),
    });

    if (existingVaultsCount >= ALLOWED_AGENTS_PER_USER) {
      return NextResponse.json(
        {
          error: `You have reached the limit of ${ALLOWED_AGENTS_PER_USER} vaults per user.`,
        },
        { status: 403 },
      );
    }

    if (
      !name ||
      !description ||
      !vaultAddress ||
      !creatorAddress ||
      !underlyingToken ||
      !chainId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newVault = await VaultAgent.create({
      name,
      description,
      image,
      systemPrompt,
      strategyDescription: strategyDescription || "Standard automated yield strategy.",
      riskProfile,
      vaultAddress: vaultAddress.toLowerCase(),
      creatorAddress: creatorAddress.toLowerCase(),
      underlyingToken: underlyingToken.toLowerCase(),
      chainId,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      vault: {
        id: newVault._id,
        name: newVault.name,
        vaultAddress: newVault.vaultAddress,
      },
      transactionHash
    });
  } catch (error) {
    console.error("Error creating vault:", error);
    return NextResponse.json(
      { error: "Failed to create vault agent" },
      { status: 500 },
    );
  }
}
