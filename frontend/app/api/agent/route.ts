import axios from "axios";

const FACILITATOR_URL = "https://facilitator.cronoslabs.org/v2/x402";
const SELLER_WALLET = process.env.SELLER_WALLET;
const USDCE_CONTRACT = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS;

export async function GET(request: Request) {
  const paymentHeader = request.headers.get("X-PAYMENT");

  if (!paymentHeader) {
    return Response.json(
      {
        message: "Payment Required",
        x402Version: 1,
        paymentRequirements: {
          scheme: "exact",
          network: "cronos-testnet",
          payTo: SELLER_WALLET,
          asset: USDCE_CONTRACT,
          description: "Premium API data access",
          mimeType: "application/json",
          maxAmountRequired: "10000", // 0.01 USDC.e with 6 decimals
          maxTimeoutSeconds: 300,
        },
      },
      { status: 402 },
    );
  }

  try {
    const requestBody = {
      x402Version: 1,
      paymentHeader: paymentHeader,
      paymentRequirements: {
        scheme: "exact",
        network: "cronos-testnet",
        payTo: SELLER_WALLET,
        asset: USDCE_CONTRACT,
        description: "Premium API data access",
        mimeType: "application/json",
        maxAmountRequired: "10000",
        maxTimeoutSeconds: 300,
      },
    };

    const verifyRes = await axios.post(
      `${FACILITATOR_URL}/verify`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "X402-Version": "1",
        },
      },
    );

    if (!verifyRes.data.isValid) {
      return Response.json(
        {
          error: "Invalid payment",
          reason: verifyRes.data.invalidReason,
        },
        { status: 402 },
      );
    }

    const settleRes = await axios.post(
      `${FACILITATOR_URL}/settle`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "X402-Version": "1",
        },
      },
    );

    if (settleRes.data.event === "payment.settled") {
      // call our remote mcp server with user prompt and return premium data
      // Simulate MCP call delay (3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return Response.json(
        {
          data: {
            premiumContent: "This is your premium data",
          },
          payment: {
            txHash: settleRes.data.txHash,
            from: settleRes.data.from,
            to: settleRes.data.to,
            value: settleRes.data.value,
            blockNumber: settleRes.data.blockNumber,
            timestamp: settleRes.data.timestamp,
          },
        },
        { status: 200 },
      );
    } else {
      return Response.json(
        {
          error: "Payment settlement failed",
          reason: settleRes.data.error,
        },
        { status: 402 },
      );
    }
  } catch (error) {
    console.error("Server error processing payment:", error);
    return Response.json(
      {
        error: "Server error processing payment",
        details: error,
      },
      { status: 500 },
    );
  }
}
