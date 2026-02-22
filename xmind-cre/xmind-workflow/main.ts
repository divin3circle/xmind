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
});

type Config = z.infer<typeof configSchema>;

type TriggerReason = "cron" | "deposit" | "withdrawal" | "emergency";

// keccak256 topic hashes for ERC-4626 Deposit/Withdraw events
const DEPOSIT_TOPIC = "0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7";
const WITHDRAW_TOPIC = "0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db";

// ─────────────────────────────────────────────────────────────────────────────
// HTTP HELPERS — Using CRE HTTPClient with runInNodeMode for simple requests
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Make a GET request via CRE's node-mode execution.
 */
function httpGet(runtime: Runtime<Config>, url: string): string {
  const httpClient = new cre.capabilities.HTTPClient();
  const doGet = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      const res = httpClient.sendRequest(nodeRuntime, { method: "GET", url }).result();
      if (res.statusCode !== 200) {
        throw new Error(`HTTP GET failed (${res.statusCode}): ${url}`);
      }
      return Buffer.from(res.body).toString("utf-8");
    },
    consensusIdenticalAggregation<string>(),
  );
  return doGet().result();
}

/**
 * Make a POST request via CRE's node-mode execution.
 */
function httpPost(runtime: Runtime<Config>, url: string, body: string): string {
  const httpClient = new cre.capabilities.HTTPClient();
  const doPost = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      const res = httpClient
        .sendRequest(nodeRuntime, {
          method: "POST",
          url,
          body,
        })
        .result();
      return Buffer.from(res.body).toString("utf-8");
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
  const url = `${runtime.config.mcpUrl}/mcp`;
  const body = JSON.stringify({ method: "tools/call", params: { name: toolName, arguments: args } });
  const text = httpPost(runtime, url, body);
  const data = JSON.parse(text) as { result?: { content?: Array<{ text: string }> } };
  const content = data?.result?.content?.[0]?.text ?? "{}";
  return JSON.parse(content);
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI AI — Via ConfidentialHTTPClient (keeps API key private from nodes)
// ─────────────────────────────────────────────────────────────────────────────

function callGemini(runtime: Runtime<Config>, prompt: string): string {
  const geminiKey = runtime.getSecret({ id: "GEMINI_API_KEY" }).result().value;

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

  const text = Buffer.from(response.body).toString("utf-8");
  const data = JSON.parse(text) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "no_action_needed";
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ORCHESTRATOR — Single decision engine for all triggers
// ─────────────────────────────────────────────────────────────────────────────
function orchestrate(runtime: Runtime<Config>, reason: TriggerReason): string {
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

  // 2. Get vault state from MCP
  const vaultState = callMcpTool(runtime, "get_vault_state", { vaultAddress: config.vaultAddress });
  runtime.log(`Vault state: ${JSON.stringify(vaultState).substring(0, 200)}`);

  // 3. Get market conditions from MCP
  const market = callMcpTool(runtime, "get_market_snapshot", {});
  runtime.log(`Market: ${JSON.stringify(market).substring(0, 200)}`);

  // 4. Analyze risk from MCP
  const risk = callMcpTool(runtime, "analyze_portfolio_risk", { vaultState });
  runtime.log(`Risk: ${JSON.stringify(risk).substring(0, 200)}`);

  // 5. Ask Gemini for a strategic decision
  const prompt = buildAIPrompt(reason, agentConfig, vaultState, market, risk);
  const aiDecision = callGemini(runtime, prompt);
  runtime.log(`AI Decision: ${aiDecision.substring(0, 300)}`);

  // 6. Log outcome to MongoDB via backend
  logAction(runtime, {
    vaultAddress: config.vaultAddress,
    action: reason,
    summary: aiDecision.substring(0, 500),
    status: "success",
  });

  runtime.log("[XMind Orchestrator] Complete.");
  return aiDecision;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
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
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER CALLBACKS
// ─────────────────────────────────────────────────────────────────────────────
const onCronTrigger = (runtime: Runtime<Config>, _payload: CronPayload): string => {
  runtime.log("Cron trigger fired.");
  return orchestrate(runtime, "cron");
};

const onDepositLog = (runtime: Runtime<Config>, _payload: EVMLog): string => {
  runtime.log("Deposit event detected.");
  return orchestrate(runtime, "deposit");
};

const onWithdrawLog = (runtime: Runtime<Config>, _payload: EVMLog): string => {
  runtime.log("Withdrawal event detected.");
  return orchestrate(runtime, "withdrawal");
};

const onEmergencyHttp = (runtime: Runtime<Config>): string => {
  runtime.log("Emergency HTTP trigger received.");
  return orchestrate(runtime, "emergency");
};

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW INIT — 4 triggers, 1 orchestrator
// ─────────────────────────────────────────────────────────────────────────────
const initWorkflow = (config: Config) => {
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
    cre.handler(cronCapability.trigger({ schedule: config.schedule }), onCronTrigger),

    // 1 — EVM Log: Deposit event
    cre.handler(
      evmClient.logTrigger({
        addresses: [vaultAddressBase64],
        topics: [{ values: [DEPOSIT_TOPIC] }],
      }),
      onDepositLog
    ),

    // 2 — EVM Log: Withdrawal event
    cre.handler(
      evmClient.logTrigger({
        addresses: [vaultAddressBase64],
        topics: [{ values: [WITHDRAW_TOPIC] }],
      }),
      onWithdrawLog
    ),

    // 3 — HTTP: Emergency
    cre.handler(httpCapability.trigger({}), onEmergencyHttp),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
export async function main() {
  const runner = await Runner.newRunner<Config>({ configSchema });
  await runner.run(initWorkflow);
}

main();
