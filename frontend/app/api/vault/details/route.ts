import dbConnect from "@/lib/db/mongodb";
import { VaultAgent } from "@/lib/models/VaultAgent";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const vaultAddress = searchParams.get("vaultAddress");

  if (!id && !vaultAddress) {
    return NextResponse.json(
      { error: "id or vaultAddress query param is required" },
      { status: 400 },
    );
  }

  let vault;
  try {
    if (id) {
      vault = await VaultAgent.findById(id);
    } else if (vaultAddress) {
      vault = await VaultAgent.findOne({ vaultAddress: vaultAddress.toLowerCase() });
    }

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      vault,
    });
  } catch (error) {
    console.error("Error fetching vault details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
