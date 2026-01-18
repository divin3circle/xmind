/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/db/mongodb";
import { Chat } from "@/lib/models/Chat";
import { chatVerifySchema } from "@/lib/validation";
import axios from "axios";
import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";
import { listMcpTools, callMcpTool } from "@/client/agent";

const FACILITATOR_URL = "https://facilitator.cronoslabs.org/v2/x402";
const SELLER_WALLET = process.env.SELLER_WALLET;
const USDCE_CONTRACT = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

        // Discover MCP tools at runtime for Gemini
        const mcpTools = await listMcpTools();

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
            tools: [{ functionDeclarations: mcpTools as any }],
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

async function executeMCPTool(
  toolName: string,
  params: unknown,
): Promise<string> {
  try {
    const args = params as Record<string, unknown>;
    const result = await callMcpTool(toolName, args);
    return JSON.stringify(result);
  } catch (err) {
    console.error(`Error executing tool ${toolName}:`, err);
    return `Error executing ${toolName}: ${err}`;
  }
}
