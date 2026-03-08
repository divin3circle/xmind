import {
  type CronPayload,
  cre,
  type EVMLog,
  getNetwork,
  hexToBase64,
  Runner,
  type Runtime,
  type NodeRuntime,
  consensusIdenticalAggregation,
} from "@chainlink/cre-sdk";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const configSchema = z.object({
  schedule: z.string(),
  vaultAddress: z.string(),
  creIntegrationAddress: z.string(),
  chainSelectorName: z.string(),
  backendUrl: z.string(),
  mcpUrl: z.string(),
  geminiApiKey: z.string(),
  aiSignerKey: z.string(),
});

type Config = z.infer<typeof configSchema>;

type TriggerReason = "cron" | "deposit" | "withdrawal" | "emergency";

// keccak256 topic hashes for ERC-4626 Deposit/Withdraw events
const DEPOSIT_TOPIC = "0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7";
const WITHDRAW_TOPIC = "0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db";

// ─────────────────────────────────────────────────────────────────────────────
// HTTP HELPERS — Using CRE HTTPClient inside runInNodeMode
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Make a GET request via CRE's node-mode execution.
 * The HTTPClient MUST be instantiated inside the runInNodeMode callback.
 */
function httpGet(runtime: Runtime<Config>, url: string): string {
  const doGet = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      const httpClient = new cre.capabilities.HTTPClient();
      const res = httpClient.sendRequest(nodeRuntime, { method: "GET", url }).result();
      if (res.statusCode !== 200) {
        throw new Error(`HTTP GET failed (${res.statusCode}): ${url}`);
      }
      // Use TextDecoder instead of Buffer (Buffer is not available in WASM)
      return new TextDecoder().decode(res.body);
    },
    consensusIdenticalAggregation<string>(),
  );
  return doGet().result();
}

/**
 * Make a POST request via CRE's node-mode execution.
 */
function httpPost(runtime: Runtime<Config>, url: string, body: string): string {
  const doPost = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      const httpClient = new cre.capabilities.HTTPClient();
      // CRE expects body as base64 — encode manually (btoa/Buffer unavailable in WASM)
      const bytes = new TextEncoder().encode(body);
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      let b64 = "";
      for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i], b1 = bytes[i + 1] ?? 0, b2 = bytes[i + 2] ?? 0;
        b64 += chars[b0 >> 2] + chars[((b0 & 3) << 4) | (b1 >> 4)];
        b64 += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : "=";
        b64 += i + 2 < bytes.length ? chars[b2 & 63] : "=";
      }
      const res = httpClient
        .sendRequest(nodeRuntime, {
          method: "POST",
          url,
          body: b64,
          headers: { "Content-Type": "application/json" },
        })
        .result();
      return new TextDecoder().decode(res.body);
    },
    consensusIdenticalAggregation<string>(),
  );
  return doPost().result();
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND + MCP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fetchAgentConfig(runtime: Runtime<Config>) {
  const url = `${runtime.config.backendUrl}/api/cre/agent-config?vaultAddress=${runtime.config.vaultAddress}`;
  const text = httpGet(runtime, url);
  return JSON.parse(text) as {
    systemPrompt: string;
    riskProfile: string;
    strategyDescription: string;
    tradingEnabled: boolean;
    maxPositionSizeBps: number;
  };
}

function logAction(runtime: Runtime<Config>, payload: {
  vaultAddress: string;
  action: string;
  summary: string;
  status: "success" | "skipped" | "error";
}): void {
  try {
    const url = `${runtime.config.backendUrl}/api/cre/log-action`;
    httpPost(runtime, url, JSON.stringify(payload));
  } catch (err) {
    runtime.log(`[LogAction] Non-fatal error: ${err}`);
  }
}

function callMcpTool(runtime: Runtime<Config>, toolName: string, args: Record<string, unknown>): unknown {
  // Use the simple REST endpoint (bypasses MCP protocol session handshake)
  const url = `${runtime.config.mcpUrl}/api/tool`;
  const body = JSON.stringify({ tool: toolName, args });
  const text = httpPost(runtime, url, body);
  runtime.log(`[MCP Response] ${toolName}: ${text.substring(0, 300)}`);
  const data = JSON.parse(text) as { result?: unknown; error?: string };
  if (data.error) {
    throw new Error(`MCP tool ${toolName} failed: ${data.error}`);
  }
  return data.result ?? {};
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI AI — Via ConfidentialHTTPClient (keeps API key private from nodes)
// ─────────────────────────────────────────────────────────────────────────────

function callGemini(runtime: Runtime<Config>, prompt: string, geminiKey: string): string {

  const confidentialHttp = new cre.capabilities.ConfidentialHTTPClient();
  const response = confidentialHttp
    .sendRequest(runtime, {
      request: {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        method: "POST",
        bodyString: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      },
    })
    .result();

  if (response.statusCode !== 200) {
    throw new Error(`Gemini API failed: status ${response.statusCode}`);
  }

  const text = new TextDecoder().decode(response.body);
  const data = JSON.parse(text) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "no_action_needed";
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ORCHESTRATOR — Single decision engine for all triggers
// ─────────────────────────────────────────────────────────────────────────────
function orchestrate(runtime: Runtime<Config>, reason: TriggerReason, geminiKey: string): string {
  const { config } = runtime;
  runtime.log(`[XMind Orchestrator] Triggered by: ${reason}`);

  // 1. Fetch agent config from backend
  const agentConfig = fetchAgentConfig(runtime);
  if (!agentConfig.tradingEnabled) {
    runtime.log("Trading is disabled. Skipping.");
    logAction(runtime, {
      vaultAddress: config.vaultAddress,
      action: reason,
      summary: "Skipped — trading disabled",
      status: "skipped",
    });
    return "Skipped — trading disabled";
  }

  // 2. Get full context in ONE MCP call  (HTTP call 1)
  //    Merges: vault state + market snapshot + risk analysis
  const context = callMcpTool(runtime, "get_full_context", { vaultAddress: config.vaultAddress }) as any;
  const { vaultState, market, risk } = context;
  runtime.log(`Vault: ${JSON.stringify(vaultState).substring(0, 150)}`);
  runtime.log(`Market: ${JSON.stringify(market).substring(0, 150)}`);
  runtime.log(`Risk: ${JSON.stringify(risk).substring(0, 150)}`);

  // 3. Ask Gemini for a strategic decision  (HTTP call 2)
  const prompt = buildAIPrompt(reason, agentConfig, vaultState, market, risk);
  const aiDecision = callGemini(runtime, prompt, geminiKey);
  runtime.log(`AI Decision: ${aiDecision.substring(0, 300)}`);

  // 4. Parse decision — if Gemini wants to trade, compile a signed instruction
  let executionResult: any = null;
  try {
    const jsonMatch = aiDecision.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.targetAllocation) {
        runtime.log("[Orchestrator] Trade intent detected. Compiling signed instruction...");

        // (HTTP call 3) — MCP compiles, signs, and returns the ready-to-submit payload
        executionResult = callMcpTool(runtime, "compile_vault_instruction", {
          vaultAddress: config.vaultAddress,
          targetAllocation: parsed.targetAllocation,
          privateKey: config.aiSignerKey
        });

        runtime.log(`[Orchestrator] Instruction status: ${executionResult?.status}`);
        if (executionResult?.instruction) {
          runtime.log(`[Orchestrator] Signed payload: vault=${executionResult.instruction.vault} asset=${executionResult.instruction.asset} amount=${executionResult.instruction.amount}`);
        }
      }
    }
  } catch (err) {
    runtime.log(`[Orchestrator] Parse/compile error (non-fatal): ${err}`);
  }

  // 5. Log outcome to MongoDB  (HTTP call 4)
  const finalStatus = executionResult?.status === "ready_for_execution"
    ? "success"
    : "success";

  logAction(runtime, {
    vaultAddress: config.vaultAddress,
    action: reason,
    summary: executionResult?.status === "ready_for_execution"
      ? `${aiDecision}\n\n--- SIGNED INSTRUCTION ---\n${JSON.stringify(executionResult.instruction, null, 2)}`
      : aiDecision,
    status: finalStatus,
  });

  runtime.log(`[XMind Orchestrator] Complete. Status: ${finalStatus}`);

  if (executionResult?.status === "ready_for_execution") {
    return JSON.stringify({
      assessment: aiDecision,
      instruction: executionResult.instruction
    });
  }

  return aiDecision;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
// Static contract interfaces — inlined to avoid an extra HTTP call
// (CRE simulator limits HTTP calls to 5 per execution)
const PROTOCOL_INTERFACES = `
CREIntegration:
  submitAIInstruction(vault, asset, amount, minAmountOut, action, isHighRisk, nonce, data, signature)
AgentVault:
  enum Action { SWAP=0, BRIDGE=1, POOL=2 }
  executeTrade(targetAsset, amount, minAmountOut, action, isHighRisk, data)
`;

function buildAIPrompt(
  reason: TriggerReason,
  agentConfig: { systemPrompt: string; riskProfile: string; strategyDescription: string; maxPositionSizeBps: number },
  vaultState: unknown,
  market: unknown,
  risk: unknown
): string {
  return [
    `You are an autonomous AI portfolio manager for XMind Capital on Avalanche.`,
    agentConfig.systemPrompt,
    `Strategy: ${agentConfig.strategyDescription}`,
    `Risk Profile: ${agentConfig.riskProfile}`,
    `Max Position Size: ${agentConfig.maxPositionSizeBps / 100}%`,
    ``,
    `PROTOCOL INTERFACES (for reference):`,
    PROTOCOL_INTERFACES,
    ``,
    `Trigger: "${reason}"`,
    `- cron → evaluate allocation vs target`,
    `- deposit → consider deploying idle capital`,
    `- withdrawal → verify 40% liquidity buffer`,
    `- emergency → consider risk-off`,
    ``,
    `VAULT STATE:`,
    JSON.stringify(vaultState, null, 2),
    ``,
    `MARKET:`,
    JSON.stringify(market, null, 2),
    ``,
    `RISK ANALYSIS:`,
    JSON.stringify(risk, null, 2),
    ``,
    `Provide: (1) assessment, (2) whether action is needed, (3) target allocation JSON if needed, (4) "no_action_needed" with reasoning if not.`,
    ``,
    `If you decide to trade, respond with a JSON block like:`,
    `{ "targetAllocation": { "AVAX": 0.3 } }`,
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER CALLBACKS
// ─────────────────────────────────────────────────────────────────────────────
// Trigger callbacks are now factory functions that close over the geminiKey
function makeCronTrigger(geminiKey: string) {
  return (runtime: Runtime<Config>, _payload: CronPayload): string => {
    runtime.log("Cron trigger fired.");
    return orchestrate(runtime, "cron", geminiKey);
  };
}

function makeDepositTrigger(geminiKey: string) {
  return (runtime: Runtime<Config>, _payload: EVMLog): string => {
    runtime.log("Deposit event detected.");
    return orchestrate(runtime, "deposit", geminiKey);
  };
}

function makeWithdrawTrigger(geminiKey: string) {
  return (runtime: Runtime<Config>, _payload: EVMLog): string => {
    runtime.log("Withdrawal event detected.");
    return orchestrate(runtime, "withdrawal", geminiKey);
  };
}

function makeEmergencyTrigger(geminiKey: string) {
  return (runtime: Runtime<Config>): string => {
    runtime.log("Emergency HTTP trigger received.");
    return orchestrate(runtime, "emergency", geminiKey);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW INIT — 4 triggers, 1 orchestrator
// ─────────────────────────────────────────────────────────────────────────────
const initWorkflow = (config: Config) => {
  // Read the Gemini API key from config (avoids DON secrets system for simulation)
  const geminiKey = config.geminiApiKey;

  const cronCapability = new cre.capabilities.CronCapability();
  const httpCapability = new cre.capabilities.HTTPCapability();

  const network = getNetwork({
    chainFamily: "evm",
    chainSelectorName: config.chainSelectorName,
    isTestnet: true,
  });

  if (!network) {
    throw new Error(`Network not found: ${config.chainSelectorName}`);
  }

  const evmClient = new cre.capabilities.EVMClient(network.chainSelector.selector);
  const vaultAddressBase64 = hexToBase64(config.vaultAddress);

  return [
    // 0 — Cron: Scheduled rebalance
    cre.handler(cronCapability.trigger({ schedule: config.schedule }), makeCronTrigger(geminiKey)),

    // 1 — EVM Log: Deposit event
    cre.handler(
      evmClient.logTrigger({
        addresses: [vaultAddressBase64],
        topics: [{ values: [DEPOSIT_TOPIC] }],
      }),
      makeDepositTrigger(geminiKey)
    ),

    // 2 — EVM Log: Withdrawal event
    cre.handler(
      evmClient.logTrigger({
        addresses: [vaultAddressBase64],
        topics: [{ values: [WITHDRAW_TOPIC] }],
      }),
      makeWithdrawTrigger(geminiKey)
    ),

    // 3 — HTTP: Emergency
    cre.handler(httpCapability.trigger({}), makeEmergencyTrigger(geminiKey)),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
export async function main() {
  const runner = await Runner.newRunner<Config>({ configSchema });
  await runner.run(initWorkflow);
}
