import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { ethers } from "ethers";
import { simulateTransaction } from "./helpers";
import { 
  getAvalancheERC20Balance,
} from "./helpers/avalanche";
import { getVaultState, getVaultPerformance } from "./helpers/portfolio";
import { getMarketSnapshot, getYieldOpportunities } from "./helpers/market";
import { simulateTrade, compileVaultInstruction } from "./helpers/execution";
import { 
  getStrategyContext, 
  storeReflection, 
  analyzePortfolioRisk, 
  checkLiquidityImpact 
} from "./helpers/strategy";

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "XMind Capital AI Terminal",
    version: "2.0.0",
    description:
      "Advanced Bloomberg-style Terminal for AI Portfolio Managers on Avalanche. Handles market intelligence, risk analytics, and deterministic execution compilation.",
  });

  async init() {
    // --- Merged Context Tool (saves HTTP calls for CRE workflow) ---
    this.server.tool(
      "get_full_context",
      "Returns vault state, market snapshot, and risk analysis in a single call. Optimized for CRE workflows with limited HTTP budget.",
      {
        vaultAddress: z.string().describe("The ERC-4626 vault contract address"),
      },
      async ({ vaultAddress }) => {
        const [vaultState, market] = await Promise.all([
          getVaultState(vaultAddress),
          getMarketSnapshot()
        ]);
        const risk = await analyzePortfolioRisk(vaultState);
        return { content: [{ type: "text", text: JSON.stringify({ vaultState, market, risk }) }] };
      },
    );

    // --- Portfolio State Tools ---
    this.server.tool(
      "get_vault_state",
      "Get comprehensive state of an AI Vault including NAV, Cash positions, and active allocations.",
      {
        vaultAddress: z.string().describe("The ERC-4626 vault contract address"),
      },
      async ({ vaultAddress }) => {
        const result = await getVaultState(vaultAddress);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    );

    this.server.tool(
        "get_vault_performance",
        "Get historical performance metrics for a vault (PnL, Sharpe, Drawdown).",
        {
          vaultAddress: z.string().describe("The vault address"),
        },
        async ({ vaultAddress }) => {
          const result = await getVaultPerformance(vaultAddress);
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      );

    // --- Market Intelligence Tools ---
    this.server.tool(
      "get_market_snapshot",
      "Get real-time market conditions, prices, and volatility sentiment for Avalanche Fuji.",
      {},
      async () => {
        const result = await getMarketSnapshot();
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    );

    this.server.tool(
        "get_yield_opportunities",
        "Query current high-yield DeFi opportunities (LPs, Lending) on Avalanche protocols like TraderJoe.",
        {},
        async () => {
          const result = await getYieldOpportunities();
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      );

    // --- Risk and Safety Tools ---
    this.server.tool(
        "analyze_portfolio_risk",
        "Perform professional risk analysis (VaR, Liquidity Risk) on a given vault state.",
        {
          vaultState: z.any().describe("The state object returned from get_vault_state"),
        },
        async ({ vaultState }) => {
          const result = await analyzePortfolioRisk(vaultState);
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      );

    this.server.tool(
        "check_liquidity_impact",
        "Calculate price impact and slippage for a proposed trade size in a specific asset.",
        {
          asset: z.string().describe("Asset symbol or address"),
          amount: z.number().describe("Amount in USD"),
        },
        async ({ asset, amount }) => {
          const result = await checkLiquidityImpact(asset, amount);
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      );

    // --- Execution Planning Tools ---
    this.server.tool(
        "simulate_trade",
        "Simulate the outcome of a trade and calculate post-trade portfolio allocations without executing.",
        {
          vaultAddress: z.string(),
          action: z.string(),
          targetAsset: z.string(),
          amountUsd: z.number(),
        },
        async (args) => {
          const result = await simulateTrade(args);
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      );

    this.server.tool(
      "compile_vault_instruction",
      "CORE: Converts a strategist's Target Allocation into a signed verifiable on-chain instruction. The strategist defines the target (e.g., AVAX 30%), the MCP compiles the trade.",
      {
        vaultAddress: z.string(),
        targetAllocation: z.record(z.string(), z.number()).describe("Map of assets to target weights (0.0 - 1.0)"),
        privateKey: z.string().describe("The AI Signer key (managed by system secrets)"),
      },
      async (args) => {
        const result = await compileVaultInstruction(args);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      },
    );

    // --- Intelligence and Learning Tools ---
    this.server.tool(
        "get_strategy_context",
        "Retrieve the agent's long-term strategy, goals, and historical constraints.",
        {
          agentId: z.string(),
        },
        async ({ agentId }) => {
          const result = await getStrategyContext(agentId);
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      );

    this.server.tool(
        "store_reflection",
        "Log a strategic reflection after a trade outcome to improve future decision making.",
        {
          agentId: z.string(),
          decision: z.string(),
          outcome: z.string(),
          reasoning: z.string(),
        },
        async (args) => {
          const result = await storeReflection(args);
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      );

    // --- Utility Tools ---
    this.server.tool(
        "get_native_balance_sdk",
        "Utility: Get native AVAX balance using the Avalanche SDK (Demonstration of SDK usage).",
        {
          address: z.string().describe("The wallet address to check"),
          network: z.enum(["mainnet", "fuji"]).optional().default("fuji"),
        },
        async ({ address, network }) => {
          const rpcUrl = network === "fuji" 
            ? "https://api.avax-test.network/ext/bc/C/rpc" 
            : "https://api.avax.network/ext/bc/C/rpc";
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const balance = await provider.getBalance(address);
          return {
            content: [{ type: "text", text: JSON.stringify({ balance: balance.toString(), network }) }],
          };
        },
      );

    this.server.tool(
      "get_contract_interfaces",
      "Returns the ABIs for the core protocol contracts (CREIntegration, AgentVault) to assist in encoding on-chain instructions.",
      {},
      async () => {
        // Return ABIs directly for LLM context
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                CREIntegration: [
                  "function submitAIInstruction(address vault, address asset, uint256 amount, uint256 minAmountOut, uint8 action, bool isHighRisk, uint256 nonce, bytes data, bytes signature) external"
                ],
                AgentVault: [
                  "enum Action { SWAP, BRIDGE, POOL }",
                  "function executeTrade(address targetAsset, uint256 amount, uint256 minAmountOut, Action action, bool isHighRisk, bytes data) external"
                ]
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.tool(
      "simulate_transaction",
      "Utility: Low-level EVM transaction simulation (for developers).",
      {
        from: z.string(),
        to: z.string(),
        value: z.string(),
        data: z.string(),
      },
      async ({ from, to, value, data }) => {
        const sim = await simulateTransaction(from || "0x000000000", to, data, value || "0x0");
        return { content: [{ type: "text", text: JSON.stringify(sim) }] };
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool registry for direct REST calls from CRE workflow (bypasses MCP protocol)
// ─────────────────────────────────────────────────────────────────────────────
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  get_vault_state: async (args) => {
    const result = await getVaultState(args.vaultAddress);
    return result;
  },
  get_vault_performance: async (args) => {
    const result = await getVaultPerformance(args.vaultAddress);
    return result;
  },
  get_market_snapshot: async () => {
    const result = await getMarketSnapshot();
    return result;
  },
  get_yield_opportunities: async () => {
    const result = await getYieldOpportunities();
    return result;
  },
  analyze_portfolio_risk: async (args) => {
    const result = await analyzePortfolioRisk(args.vaultState);
    return result;
  },
  check_liquidity_impact: async (args) => {
    const result = await checkLiquidityImpact(args.asset, args.amount);
    return result;
  },
  simulate_trade: async (args) => {
    const result = await simulateTrade(args);
    return result;
  },
  compile_vault_instruction: async (args) => {
    const result = await compileVaultInstruction(args);
    return result;
  },
  get_full_context: async (args) => {
    const [vaultState, market] = await Promise.all([
      getVaultState(args.vaultAddress),
      getMarketSnapshot()
    ]);
    const risk = await analyzePortfolioRisk(vaultState);
    return { vaultState, market, risk };
  },
  get_contract_interfaces: async () => {
    return {
      CREIntegration: [
        "function submitAIInstruction(address vault, address asset, uint256 amount, uint256 minAmountOut, uint8 action, bool isHighRisk, uint256 nonce, bytes data, bytes signature) external"
      ],
      AgentVault: [
        "enum Action { SWAP, BRIDGE, POOL }",
        "function executeTrade(address targetAsset, uint256 amount, uint256 minAmountOut, Action action, bool isHighRisk, bytes data) external"
      ]
    };
  },
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    // Simple REST endpoint for CRE workflow tool calls (no MCP session needed)
    if (url.pathname === "/api/tool" && request.method === "POST") {
      try {
        const body = await request.json() as { tool: string; args?: Record<string, any> };
        const handler = toolHandlers[body.tool];
        if (!handler) {
          return Response.json({ error: `Unknown tool: ${body.tool}` }, { status: 400 });
        }
        const result = await handler(body.args || {});
        // BigInt-safe serialization (ethers.js returns BigInt from RPC calls)
        const jsonStr = JSON.stringify({ result }, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value
        );
        return new Response(jsonStr, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        return Response.json({ error: err.message || String(err) }, { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
