import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { env } from "cloudflare:workers";
import { z } from "zod";
import {
  checkIfTokenIsWhitelistedOnProtocol,
  getAllTickers,
  getAvailablePools,
  getErc20TokenBalance,
  getFarmBySymbol,
  getTickerByInstrument,
  getTxnByHash,
  getTxnCountByAddress,
  getTxnStatusByHash,
  getContractAbi,
  getWalletAddressOrCronosIdBalance,
  validateCronosId,
  resolveCronosIdToAddress,
  resolveAddressToCronosId,
  getBestBridgeRoute,
  getSupportedChains,
  getTokenDetails,
  getChainTokenBySymbol,
  simulateTransaction,
} from "./helpers";
import { Client } from "@crypto.com/developer-platform-client";
import { createConfig } from "@lifi/sdk";

Client.init({
  apiKey: env.CRYPTO_COM_API_KEY,
});

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "XMind MCP Server",
    version: "1.0.0",
    description:
      "Intelligent Web3 Agent/Assistant on CronosEVM helping users with DeFi, Wallet management and staying safe in the crypto space.",
  });

  async init() {
    this.server.tool(
      "get_available_pools",
      "Get available liquidity pools from Cronos DeFi protocols(H2 or VVS).",
      {
        protocol: z.enum(["vvs", "h2"]),
      },
      async ({ protocol }) => {
        const pools = await getAvailablePools(protocol);

        return {
          content: [{ type: "text", text: JSON.stringify(pools.data) }],
        };
      },
    );

    this.server.tool(
      "get_farm_by_symbol",
      "Get farm details by LP symbol from Cronos DeFi protocols(H2 or VVS).",
      {
        protocol: z.enum(["vvs", "h2"]),
        symbol: z.string(),
      },
      async ({ protocol, symbol }) => {
        const farm = await getFarmBySymbol(protocol, symbol);
        if (!farm) {
          return {
            content: [
              {
                type: "text",
                text: `No farm found for symbol ${symbol} on protocol ${protocol}`,
              },
            ],
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(farm.data) }],
        };
      },
    );

    this.server.tool(
      "get_tickers",
      "Get all tickers from Crypto.com Exchange",
      {},
      async () => {
        const tickers = await getAllTickers();
        return {
          content: [{ type: "text", text: JSON.stringify(tickers.data) }],
        };
      },
    );

    this.server.tool(
      "check_token_whitelist",
      "Check if a token is whitelisted on a given DeFi protocol(H2 or VVS).",
      {
        protocol: z.enum(["vvs", "h2"]),
        tokenAddress: z.string(),
      },
      async ({ protocol, tokenAddress }) => {
        const isWhitelisted = await checkIfTokenIsWhitelistedOnProtocol(
          protocol,
          tokenAddress,
        );
        return {
          content: [
            {
              type: "text",
              text: `Token ${tokenAddress} is ${
                isWhitelisted ? "" : "not "
              }whitelisted on protocol ${protocol}`,
            },
          ],
        };
      },
    );

    this.server.tool(
      "get_wallet_balance",
      "Get wallet balance by wallet address or Cronos ID",
      {
        identifier: z.string(),
      },
      async ({ identifier }) => {
        const balanceResponse =
          await getWalletAddressOrCronosIdBalance(identifier);
        return {
          content: [
            {
              type: "text",
              text: `Balance for ${identifier}: ${JSON.stringify(
                balanceResponse.data,
              )}`,
            },
          ],
        };
      },
    );

    this.server.tool(
      "get_erc20_token_balance",
      "Get ERC20 token balance for a wallet address and token address",
      {
        walletAddress: z.string(),
        tokenAddress: z.string(),
      },
      async ({ walletAddress, tokenAddress }) => {
        const balanceResponse = await getErc20TokenBalance(
          walletAddress,
          tokenAddress,
        );
        return {
          content: [
            {
              type: "text",
              text: `ERC20 Token Balance for wallet ${walletAddress} and token ${tokenAddress}: ${JSON.stringify(
                balanceResponse.data,
              )}`,
            },
          ],
        };
      },
    );

    this.server.tool(
      "get_txn_by_hash",
      "Get transaction details by transaction hash",
      {
        txnHash: z.string(),
      },
      async ({ txnHash }) => {
        const txnResponse = await getTxnByHash(txnHash);
        return {
          content: [{ type: "text", text: JSON.stringify(txnResponse.data) }],
        };
      },
    );

    this.server.tool(
      "get_txn_status",
      "Get transaction status by transaction hash",
      {
        txnHash: z.string(),
      },
      async ({ txnHash }) => {
        const statusResponse = await getTxnStatusByHash(txnHash);
        return {
          content: [
            { type: "text", text: JSON.stringify(statusResponse.data) },
          ],
        };
      },
    );

    this.server.tool(
      "get_txn_count",
      "Get transaction count for a wallet address",
      {
        walletAddress: z.string(),
      },
      async ({ walletAddress }) => {
        const countResponse = await getTxnCountByAddress(walletAddress);
        return {
          content: [{ type: "text", text: JSON.stringify(countResponse.data) }],
        };
      },
    );

    this.server.tool(
      "get_contract_abi",
      "Get contract ABI/code by contract address",
      {
        contractAddress: z.string(),
      },
      async ({ contractAddress }) => {
        const abiResponse = await getContractAbi(contractAddress);
        return {
          content: [{ type: "text", text: JSON.stringify(abiResponse.data) }],
        };
      },
    );

    this.server.tool(
      "validate_cronos_id",
      "Validate whether a string is a valid Cronos ID",
      {
        identifier: z.string(),
      },
      async ({ identifier }) => {
        const isValid = validateCronosId(identifier);
        return {
          content: [
            {
              type: "text",
              text: `Identifier ${identifier} is ${isValid ? "a valid" : "not a valid"} Cronos ID`,
            },
          ],
        };
      },
    );

    this.server.tool(
      "get_ticker_detail",
      "Get ticker details by instrument symbol from Crypto.com Exchange",
      {
        instrument: z.string(),
      },
      async ({ instrument }) => {
        const tickerDetail = await getTickerByInstrument(instrument);
        return {
          content: [{ type: "text", text: JSON.stringify(tickerDetail) }],
        };
      },
    );

    this.server.tool(
      "resolve_cronos_id",
      "Resolve Cronos ID to wallet address",
      {
        cronosId: z.string(),
      },
      async ({ cronosId }) => {
        const addressResponse = await resolveCronosIdToAddress(cronosId);
        return {
          content: [
            { type: "text", text: JSON.stringify(addressResponse.data) },
          ],
        };
      },
    );

    this.server.tool(
      "resolve_address_to_cronos_id",
      "Resolve wallet address to Cronos ID",
      {
        address: z.string().startsWith("0x").length(42),
      },
      async ({ address }) => {
        const cronosIdResponse = await resolveAddressToCronosId(address);
        return {
          content: [
            { type: "text", text: JSON.stringify(cronosIdResponse.data) },
          ],
        };
      },
    );

    this.server.tool(
      "simulate_transaction",
      "Simulate a transaction on Cronos EVM to analyze its effects and risks",
      {
        from: z.string().describe("This is the sender's wallet address"),
        to: z
          .string()
          .describe(
            "This is the address to which you are sending the transaction",
          ),
        value: z.string().describe("This is the amount of ETH to send in wei"),
        data: z.string().describe("This is the calldata for the transaction"),
      },
      async ({ from, to, value, data }) => {
        const fromAddress =
          from || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        const sim = await simulateTransaction(
          fromAddress,
          to,
          data,
          value || "0x0",
        );
        return {
          content: [{ type: "text", text: JSON.stringify(sim) }],
        };
      },
    );

    this.server.tool(
      "get_bridge_routes",
      "Get best bridge routes between two chains for given assets and amount",
      {
        fromChain: z
          .string()
          .describe("The chain ID the user wants to bridge from"),
        toChain: z
          .string()
          .describe("The chain ID the user wants to bridge to"),
        fromTokenAddress: z
          .string()
          .describe("The asset/token the user wants to bridge"),
        toTokenAddress: z
          .string()
          .describe(
            "The asset/token the user wants to receive on the destination chain",
          ),
        amount: z.string().describe("The amount of the asset/token to bridge"),
        fromAddress: z
          .string()
          .describe("The wallet address initiating the bridge"),
      },
      async ({
        fromAddress,
        fromChain,
        toChain,
        fromTokenAddress,
        toTokenAddress,
        amount,
      }) => {
        const bestQuote = await getBestBridgeRoute(
          fromChain,
          toChain,
          fromTokenAddress,
          toTokenAddress,
          amount,
          fromAddress,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(bestQuote) }],
        };
      },
    );

    this.server.tool(
      "get_supported_chains",
      "Get supported chains for bridging",
      {},
      async () => {
        const chains = await getSupportedChains();
        return {
          content: [{ type: "text", text: JSON.stringify(chains) }],
        };
      },
    );

    this.server.tool(
      "get_token_from_symbol_and_chain",
      "Get token details by its symbol and chain ID",
      {
        symbol: z.string(),
        chainId: z.number(),
      },
      async ({ symbol, chainId }) => {
        const token = await getChainTokenBySymbol(chainId, symbol);
        return {
          content: [{ type: "text", text: JSON.stringify(token) }],
        };
      },
    );

    this.server.tool(
      "get_token_details",
      "Get token details like decimals by chain ID and token address",
      {
        chainId: z.number(),
        tokenAddress: z.string(),
      },
      async ({ chainId, tokenAddress }) => {
        const tokenDetails = await getTokenDetails(chainId, tokenAddress);
        return {
          content: [{ type: "text", text: JSON.stringify(tokenDetails) }],
        };
      },
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    createConfig({
      integrator: "XMind",
    });

    const url = new URL(request.url);

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
