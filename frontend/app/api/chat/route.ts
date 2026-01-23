import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { AgentChat } from "@/lib/models/AgentChat";
import { Agents } from "@/lib/models/Agents";
import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";
import { listMcpTools, callMcpTool } from "@/client/agent";
import config from "@/config/env";
import { cryptr } from "../agent/create/route";

const FALLBACK_GEMINI_API_KEY = config.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { message, agentId, userAddress } = body;

    if (!message || !agentId || !userAddress) {
      return NextResponse.json(
        { error: "Missing required fields: message, agentId, or userAddress" },
        { status: 400 },
      );
    }

    const agent = await Agents.findOne({ _id: agentId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const geminiApiKey = agent.geminiKey || FALLBACK_GEMINI_API_KEY;
    let usingAgentKey = !!agent.geminiKey;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "No Gemini API key available for this agent" },
        { status: 500 },
      );
    }

    const decryptedKey = cryptr.decrypt(agent.encryptedPrivateKey);

    // TODO: Check agent's USDC balance and bill if using fallback key
    let ai;
    try {
      ai = new GoogleGenAI({ apiKey: geminiApiKey });
    } catch (error) {
      console.error("Error initializing Gemini AI:", error);
      if (usingAgentKey && FALLBACK_GEMINI_API_KEY) {
        console.warn("Agent's Gemini key invalid, using fallback");
        ai = new GoogleGenAI({ apiKey: FALLBACK_GEMINI_API_KEY });
        usingAgentKey = false;
      } else {
        return NextResponse.json(
          { error: "Failed to initialize Gemini AI" },
          { status: 500 },
        );
      }
    }

    const lowerAgentId = agentId.toLowerCase().trim();
    const lowerUserAddress = userAddress.toLowerCase().trim();

    let chat = await AgentChat.findOne({
      agentId: lowerAgentId,
      userAddress: lowerUserAddress,
    });

    const conversationHistory = [];

    let x402Header: string | null = null;

    const headerMatch = message.match(/x402[:\s]+([\s\S]*?)(?:\n\n|$)/i);
    if (headerMatch && headerMatch[1]) {
      const extractedHeader = headerMatch[1].replace(/\s/g, "");
      x402Header = extractedHeader;
      console.log(
        `X402 header extracted from user message (${extractedHeader.length} chars), will reuse for all paid API calls`,
      );
    }

    if (agent.systemPrompt) {
      const agentDetails = {
        name: agent.name,
        contractAddress: agent.contractAddress,
        walletAddress: agent.walletAddress,
        description: agent.description,
        id: agent._id,
        createdAt: agent.createdAt,
        tasksRan: agent.tasksRan,
        earnings: agent.earnings,
        creatorAddress: agent.creatorAddress,
        creationTxHash: agent.transactionHash,
        privateKey: decryptedKey,
      };

      const systemMessage = `System instructions: ${agent.systemPrompt}

Agent Self-Info:
${JSON.stringify(agentDetails, null, 2)}

PAYMENT PROTOCOL (X402):
- Some endpoints (get_paid_farm_pools, get_paid_tickers) require payment: 0.1 USDC.e on Cronos testnet
- If user needs paid data, ASK THEM UPFRONT for an X402 payment header
- User can obtain header by calling: sign_x402_payment_header with their private key
- Once user provides the header, you will REUSE IT AUTOMATICALLY for all paid requests (valid for 5 minutes)
- NO NEED TO ASK AGAIN - one header pays for multiple API calls
- Format: when user provides header, include it in subsequent paid tool calls
- This is WAY better UX than asking for payment per request!

IMPORTANT - USER EXPERIENCE:
- NEVER show raw tool invocations, tool_code blocks, or technical function calls to the user
- Present all results in natural, user-friendly language
- Summarize outcomes clearly (e.g., "Sent 1 TCRO to 0x28eEE..." instead of showing the raw tool call)
- Hide implementation details—the user should only see the result, not how you did it

Important: You have access to your own wallet address (${agent.walletAddress}), smart contract (${agent.contractAddress}), creator address (${agent.creatorAddress}), creation transaction hash (${agent.creationTxHash}) among other details from your Agent Self-Info above. `;

      conversationHistory.push({
        role: "user",
        parts: [{ text: systemMessage }],
      });
      conversationHistory.push({
        role: "model",
        parts: [
          {
            text: "Understood. I will follow these instructions and I'm aware of my details and capabilities. I can use my own walletAddress to check my balance and other account details.",
          },
        ],
      });
    }

    if (agent.actions && agent.actions.length > 0) {
      const recentActions = agent.actions.slice(-5);
      const actionsContext = recentActions
        .map(
          (action: { title: never; body: never; ranAt: never }) =>
            `Previous action: ${action.title} - ${action.body} (ran at ${action.ranAt})`,
        )
        .join("\n");

      conversationHistory.push({
        role: "user",
        parts: [
          {
            text: `Here are some recent actions I've performed:\n${actionsContext}`,
          },
        ],
      });
      conversationHistory.push({
        role: "model",
        parts: [{ text: "I've noted these recent actions." }],
      });
    }

    if (chat && chat.messages && chat.messages.length > 0) {
      const recentMessages = chat.messages.slice(-10); // Last 10 messages

      for (const msg of recentMessages) {
        conversationHistory.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    conversationHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    const mcpTools = await listMcpTools();

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: conversationHistory,
      config: {
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          },
        },
        tools: [{ functionDeclarations: mcpTools as never }],
      },
    });

    const toolResults: { toolName: string | undefined; result: unknown }[] = [];
    const toolCalls = response.functionCalls || [];

    if (toolCalls && toolCalls.length > 0) {
      for (const call of toolCalls) {
        console.log(`Executing tool: ${call.name}`, call.args);
        try {
          let toolArgs: Record<string, unknown> = call.args as Record<
            string,
            unknown
          >;
          const paidTools = ["get_paid_farm_pools", "get_paid_tickers"];

          if (x402Header && paidTools.includes(call.name ?? "")) {
            console.log(`Auto-injecting X402 header into ${call.name}`);
            toolArgs = { ...toolArgs, paymentHeader: x402Header };
          }

          const result = await callMcpTool(call.name ?? "", toolArgs);
          toolResults.push({
            toolName: call.name,
            result: result,
          });

          if (call.name) {
            await Agents.findOneAndUpdate(
              { contractAddress: agentId },
              {
                $push: {
                  actions: {
                    title: call.name,
                    body: JSON.stringify(call.args),
                    ranAt: new Date(),
                    usdceConsumed: 0.001, // TODO: Calculate actual cost
                  },
                },
                $inc: { tasksRan: 1 },
              },
            );
          }
        } catch (error) {
          console.error(`Error executing tool ${call.name}:`, error);
          toolResults.push({
            toolName: call.name,
            result: `Error: ${error}`,
          });
        }
      }
    }

    let finalResponse = response.text ?? "";

    if (toolResults.length > 0) {
      const toolResultsText = toolResults
        .map((r) => `Tool ${r.toolName} returned: ${JSON.stringify(r.result)}`)
        .join("\n");

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
        model: "gemini-2.0-flash-exp",
        contents: finalContents,
      });
      finalResponse = finalRes.text ?? "";
    }

    if (!chat) {
      chat = new AgentChat({
        agentId: lowerAgentId,
        userAddress: lowerUserAddress,
        messages: [
          { content: message, timestamp: new Date(), sender: "user" },
          { content: finalResponse, timestamp: new Date(), sender: "agent" },
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

    return NextResponse.json({
      success: true,
      response: finalResponse,
      toolsUsed: toolResults.map((r) => r.toolName),
      usingAgentKey,
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);

    const errorObj = error as { status?: number; message?: string };
    const isQuotaError =
      errorObj?.status === 429 ||
      errorObj?.message?.includes("quota") ||
      errorObj?.message?.includes("RESOURCE_EXHAUSTED") ||
      errorObj?.message?.includes("rate limit");

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "Quota exceeded. The agent has reached its API limit. Please try again later or contact the agent owner.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process chat",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const userAddress = searchParams.get("userAddress");

    if (!agentId || !userAddress) {
      return NextResponse.json(
        { error: "Missing agentId or userAddress" },
        { status: 400 },
      );
    }

    const chat = await AgentChat.findOne({
      agentId: agentId.toLowerCase().trim(),
      userAddress: userAddress.toLowerCase().trim(),
    });

    return NextResponse.json({
      success: true,
      chat: chat || null,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch chat",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
