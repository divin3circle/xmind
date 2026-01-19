import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Template } from "@/lib/models/Template";

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching templates..." + req.url);
    await dbConnect();

    const templates = await Template.find().sort({ createdAt: -1 });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" + error },
      { status: 500 },
    );
  }
}
