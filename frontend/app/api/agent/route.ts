/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/db/mongodb";
import { Chat } from "@/lib/models/Chat";
import { chatVerifySchema } from "@/lib/validation";
import axios from "axios";
import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";

const FACILITATOR_URL = "https://facilitator.cronoslabs.org/v2/x402";
const SELLER_WALLET = process.env.SELLER_WALLET;
const USDCE_CONTRACT = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Define MCP tools for Gemini to use (with parametersJsonSchema)
const MCP_TOOLS = [
  {
    name: "get_available_pools",
    description:
      "Fetch available farms/pools from Crypto.com SDK for yield optimization",
    parametersJsonSchema: {
      type: "object",
      properties: {
        network: {
          type: "string",
          enum: ["cronos_zkevm", "cronos_pos"],
          description: "Network to fetch pools from",
        },
        tokenFilter: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of tokens to filter by",
        },
      },
      required: ["network"],
    },
  },
  {
    name: "get_tickers",
    description: "Fetch all available tickers from exchange",
    parametersJsonSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_ticker_detail",
    description:
      "Get detailed ticker info for specific instrument (e.g., BTC_USDT)",
    parametersJsonSchema: {
      type: "object",
      properties: {
        instrument: {
          type: "string",
          description: "Ticker instrument like BTC_USDT",
        },
      },
      required: ["instrument"],
    },
  },
  {
    name: "simulate_transaction",
    description:
      "Simulate a transaction on forked Cronos zkEVM for phishing detection",
    parametersJsonSchema: {
      type: "object",
      properties: {
        contract: {
          type: "string",
          description: "Contract address to call",
        },
        calldata: {
          type: "string",
          description: "Encoded function call data",
        },
        from: {
          type: "string",
          description: "Sender address (optional)",
        },
      },
      required: ["contract", "calldata"],
    },
  },
  {
    name: "get_bridge_routes",
    description: "Aggregate bridge routes and fees between chains",
    parametersJsonSchema: {
      type: "object",
      properties: {
        fromChain: {
          type: "string",
          description: "Source chain",
        },
        toChain: {
          type: "string",
          description: "Destination chain",
        },
        asset: {
          type: "string",
          description: "Asset to bridge (e.g., USDC)",
        },
        amount: {
          type: "string",
          description: "Amount to bridge",
        },
      },
      required: ["fromChain", "toChain", "asset", "amount"],
    },
  },
  {
    name: "parse_intent_to_userops",
    description:
      "Parse natural language intent to UserOps for Account Abstraction",
    parametersJsonSchema: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          description:
            "Natural language intent (e.g., 'Swap 100 USDC to VVS and stake')",
        },
        chain: {
          type: "string",
          description: "Target chain (optional)",
        },
      },
      required: ["intent"],
    },
  },
];

export async function POST(request: Request) {
  const paymentHeader = request.headers.get("X-PAYMENT");
  const body = await request.json();

  const validation = chatVerifySchema.safeParse(body);
  if (!validation.success) {
    return Response.json(
      { error: "Validation failed", details: validation.error },
      { status: 400 },
    );
  }

  const { message, agentId, userAddress } = validation.data;

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
          description: `Access to premium data from agent ${agentId}`,
          mimeType: "application/json",
          maxAmountRequired: "100", // 0.0001 USDC.e with 6 decimals
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
        description: `Access to premium data from agent ${agentId}`,
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
      try {
        // Connect to MongoDB and fetch chat history
        await dbConnect();
        const lowerId = agentId.toLowerCase().trim();
        const userAddressLower = userAddress.toLowerCase().trim();
        
        let chat = await Chat.findOne({
          agentId: lowerId,
          userAddress: userAddressLower,
        });

        // Build conversation history for context
        const conversationHistory = [];
        
        if (chat && chat.messages && chat.messages.length > 0) {
          // Get last 5 messages (or fewer if not available)
          const recentMessages = chat.messages.slice(-5);
          
          for (const msg of recentMessages) {
            conversationHistory.push({
              role: msg.sender === "user" ? "user" : "model",
              parts: [{ text: msg.content }],
            });
          }
        }
        
        // Add current user message
        conversationHistory.push({
          role: "user",
          parts: [{ text: message }],
        });

        // First request: ask Gemini to use tools with conversation history
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: conversationHistory as any,
          config: {
            toolConfig: {
              functionCallingConfig: {
                mode: FunctionCallingConfigMode.AUTO,
              },
            },
            tools: [{ functionDeclarations: MCP_TOOLS as any }],
          },
        });

        const toolResults: { toolName: string | undefined; result: unknown }[] =
          [];
        const toolCalls = response.functionCalls || [];

        // Execute each tool call
        if (toolCalls && toolCalls.length > 0) {
          for (const call of toolCalls) {
            console.log(`Executing tool: ${call.name}`, call.args);
            const result = await executeMCPTool(call.name ?? "", call.args);
            toolResults.push({
              toolName: call.name,
              result: result,
            });
          }
        }

        // Generate final response based on tool results
        let finalResponse = response.text ?? "";

        if (toolResults.length > 0) {
          // Send tool results back to Gemini for final answer
          const toolResultsText = toolResults
            .map((r) => `Tool ${r.toolName} returned: ${r.result}`)
            .join("\n");

          // Use conversation history + tool results
          const finalContents = [...conversationHistory];
          finalContents.push({
            role: "model",
            parts: [{ text: response.text ?? "" }],
          });
          finalContents.push({
            role: "user",
            parts: [
              {
                text: `Tool execution results:\n${toolResultsText}\n\nProvide a clear final answer based on these results.`,
              },
            ],
          });

          const finalRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: finalContents as any,
          });
          finalResponse = finalRes.text ?? "";
        }

        // Save to MongoDB (chat was already fetched at the beginning for history)
        if (!chat) {
          chat = new Chat({
            agentId: lowerId,
            userAddress: userAddressLower,
            messages: [
              { content: message, timestamp: new Date(), sender: "user" },
              {
                content: finalResponse,
                timestamp: new Date(),
                sender: "agent",
              },
            ],
          });
          await chat.save();
        } else {
          chat.messages.push({
            content: message,
            timestamp: new Date(),
            sender: "user",
          });
          chat.messages.push({
            content: finalResponse,
            timestamp: new Date(),
            sender: "agent",
          });
          await chat.save();
        }

        return Response.json(
          {
            data: {
              premiumContent: finalResponse,
              toolsUsed: toolResults.map((r) => r.toolName),
              debugInfo: {
                toolCalls: toolCalls?.map((c) => ({
                  name: c.name ?? "unknown",
                  args: c.args,
                })),
                toolResults,
              },
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
      } catch (geminiError) {
        console.error("Gemini error:", geminiError);
        return Response.json(
          {
            error: "Agent processing failed",
            details:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
          },
          { status: 500 },
        );
      }
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
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// Execute MCP tool - currently using local implementations (mock data)
// Later: Replace with actual MCP server calls via HTTP
async function executeMCPTool(
  toolName: string,
  params: unknown,
): Promise<string> {
  try {
    const args = params as Record<string, unknown>;

    switch (toolName) {
      case "get_available_pools": {
        const network = args.network as string;
        const mockPools = [
          {
            id: "pool_1",
            name: "VVS/USDC.e",
            apy: 45.2,
            tvl: 5000000,
            network,
          },
          {
            id: "pool_2",
            name: "CRO/USDC.e",
            apy: 32.1,
            tvl: 3500000,
            network,
          },
          {
            id: "pool_3",
            name: "ATOM/USDC.e",
            apy: 28.5,
            tvl: 2000000,
            network,
          },
        ];
        return JSON.stringify(mockPools);
      }

      case "get_tickers": {
        const mockTickers = [
          { instrument: "BTC_USDT", last: 98500, change24h: 2.5 },
          { instrument: "ETH_USDT", last: 3500, change24h: 1.8 },
          { instrument: "CRO_USDT", last: 0.85, change24h: -0.5 },
          { instrument: "VVS_USDT", last: 0.032, change24h: 5.2 },
        ];
        return JSON.stringify(mockTickers);
      }

      case "get_ticker_detail": {
        const instrument = args.instrument as string;
        const mockDetails = {
          instrument,
          last: 98500,
          open: 96200,
          high: 99800,
          low: 96000,
          change24h: 2.5,
          volume24h: 45000000,
          bid: 98490,
          ask: 98510,
        };
        return JSON.stringify(mockDetails);
      }

      case "simulate_transaction": {
        const mockSimulation = {
          success: true,
          contract: args.contract,
          function: "transfer",
          stateChanges: [
            {
              address: args.contract,
              balanceDelta: "-1000000000000000000",
            },
          ],
          riskFactors: ["none"],
          warning: null,
        };
        return JSON.stringify(mockSimulation);
      }

      case "get_bridge_routes": {
        const fromChain = args.fromChain as string;
        const toChain = args.toChain as string;
        const asset = args.asset as string;
        const amount = args.amount as string;
        const mockRoutes = [
          {
            provider: "Jumper",
            fromChain,
            toChain,
            asset,
            amount,
            fee: "0.1%",
            feeCost: "0.001",
            time: "5 minutes",
            route: "Cronos -> Ethereum Bridge",
          },
          {
            provider: "Layerswap",
            fromChain,
            toChain,
            asset,
            amount,
            fee: "0.15%",
            feeCost: "0.0015",
            time: "10 minutes",
            route: "Cronos -> Polygon -> Ethereum",
          },
        ];
        return JSON.stringify(mockRoutes);
      }

      case "parse_intent_to_userops": {
        const intent = args.intent as string;
        const chain = (args.chain as string) || "cronos_zkevm";
        const mockUserOps = {
          intent,
          chain,
          operations: [
            {
              type: "approve",
              token: "USDC.e",
              amount: "100",
              spender: "swap_router",
            },
            {
              type: "swap",
              from: "USDC.e",
              to: "VVS",
              amount: "100",
              slippage: "0.5%",
            },
            {
              type: "stake",
              token: "VVS",
              amount: "100",
              pool: "vvs_stake_pool",
            },
          ],
          estimatedGas: "450000",
          signature: "pending",
        };
        return JSON.stringify(mockUserOps);
      }

      default:
        return `Error: Unknown tool ${toolName}`;
    }
  } catch (err) {
    console.error(`Error executing tool ${toolName}:`, err);
    return `Error executing ${toolName}: ${err}`;
  }
}
