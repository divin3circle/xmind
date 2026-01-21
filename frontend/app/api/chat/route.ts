import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { AgentChat } from "@/lib/models/AgentChat";
import { Agents } from "@/lib/models/Agents";
import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";
import { listMcpTools, callMcpTool } from "@/client/agent";

const FALLBACK_GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { message, agentId, userAddress } = body;

    // Validate input
    if (!message || !agentId || !userAddress) {
      return NextResponse.json(
        { error: "Missing required fields: message, agentId, or userAddress" },
        { status: 400 },
      );
    }

    // Fetch agent from database
    const agent = await Agents.findOne({ contractAddress: agentId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Determine which API key to use
    const geminiApiKey = agent.geminiKey || FALLBACK_GEMINI_API_KEY;
    let usingAgentKey = !!agent.geminiKey;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "No Gemini API key available for this agent" },
        { status: 500 },
      );
    }

    // TODO: Check agent's USDC balance and bill if using fallback key
    // For now, we'll just proceed with the key

    // Initialize Gemini AI
    let ai;
    try {
      ai = new GoogleGenAI({ apiKey: geminiApiKey });
    } catch (error) {
      // If agent's key is invalid, try fallback
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

    // Fetch or create chat history
    const lowerAgentId = agentId.toLowerCase().trim();
    const lowerUserAddress = userAddress.toLowerCase().trim();

    let chat = await AgentChat.findOne({
      agentId: lowerAgentId,
      userAddress: lowerUserAddress,
    });

    // Build conversation history
    const conversationHistory = [];

    // Add system prompt from agent
    if (agent.systemPrompt) {
      conversationHistory.push({
        role: "user",
        parts: [{ text: `System instructions: ${agent.systemPrompt}` }],
      });
      conversationHistory.push({
        role: "model",
        parts: [{ text: "Understood. I will follow these instructions." }],
      });
    }

    // Add recent actions performed by agent as context
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

    // Add previous chat messages
    if (chat && chat.messages && chat.messages.length > 0) {
      const recentMessages = chat.messages.slice(-10); // Last 10 messages

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

    // Get MCP tools
    const mcpTools = await listMcpTools();

    // Generate response with Gemini
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

    // Handle tool calls
    const toolResults: { toolName: string | undefined; result: unknown }[] = [];
    const toolCalls = response.functionCalls || [];

    if (toolCalls && toolCalls.length > 0) {
      for (const call of toolCalls) {
        console.log(`Executing tool: ${call.name}`, call.args);
        try {
          const result = await callMcpTool(
            call.name ?? "",
            call.args as Record<string, unknown>,
          );
          toolResults.push({
            toolName: call.name,
            result: result,
          });

          // Log this action to the agent's actions array
          if (call.name) {
            await Agents.findOneAndUpdate(
              { contractAddress: agentId },
              {
                $push: {
                  actions: {
                    title: call.name,
                    body: JSON.stringify(call.args),
                    ranAt: new Date(),
                    usdceConsumed: 0, // TODO: Calculate actual cost
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

    // Generate final response with tool results
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

    // Save chat to database
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
