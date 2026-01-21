import { NextRequest, NextResponse } from "next/server";
import { Client } from "@crypto.com/developer-platform-client";
import config from "@/config/env";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  "http://localhost:3000",
];

export async function POST(request: NextRequest) {
  try {
    const urlOrigin = new URL(request.url).origin;
    if (urlOrigin && !allowedOrigins.includes(urlOrigin)) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403 },
      );
    }

    Client.init({
      apiKey: config.CRYPTO_COM_API_KEY,
    });

    const { Wallet } = await import("@crypto.com/developer-platform-client");
    const wallet = await Wallet.create();

    return NextResponse.json({
      status: "success",
      data: {
        address: wallet.data.address,
        privateKey: wallet.data.privateKey,
        mnemonic: wallet.data.mnemonic || "",
      },
    });
  } catch (error) {
    console.error("Error in wallet route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
