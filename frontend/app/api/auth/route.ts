import { NextRequest, NextResponse } from "next/server";
import { generateNonce, verifyWalletSignature } from "@/lib/auth";
import { User } from "@/lib/models/User";
import { authVerifySchema } from "@/lib/validation";
import dbConnect from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log(req.method);

    return NextResponse.json({
      nonce,
      expiresAt,
      message: `Sign this message with your wallet to authenticate:\n\nNonce: ${nonce}`,
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = authVerifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { walletAddress, signature, message } = validation.data;

    // Verify signature
    const verificationResult = await verifyWalletSignature(
      walletAddress,
      signature,
      message
    );

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error || "Invalid signature" },
        { status: 401 }
      );
    }

    await dbConnect();

    const lowerWalletAddress = walletAddress.toLowerCase();
    let user = await User.findOne({ walletAddress: lowerWalletAddress });

    if (!user) {
      user = new User({
        walletAddress: lowerWalletAddress,
        displayName: `User ${lowerWalletAddress.slice(0, 6)}`,
        spentUsdc: 0,
      });
      await user.save();
    }

    return NextResponse.json({
      success: true,
      walletAddress: lowerWalletAddress,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        spentUsdc: user.spentUsdc,
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });
  }
}
