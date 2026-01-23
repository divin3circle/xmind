import dbConnect from "@/lib/db/mongodb";
import { Agents } from "@/lib/models/Agents";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");
  console.log("Fetching my agents for request:", walletAddress);

  if (!walletAddress) {
    return NextResponse.json(
      { error: "walletAddress query param is required" },
      { status: 400 },
    );
  }

  const myAgents = await Agents.find({
    creatorAddress: walletAddress.toLowerCase(),
  });

  return NextResponse.json({
    success: true,
    agents: myAgents,
  });
}
