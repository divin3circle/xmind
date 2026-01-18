import {
  Defi,
  DefiProtocol,
  Exchange,
  Wallet,
  Token,
  Transaction,
  CronosId,
  Contract,
} from "@crypto.com/developer-platform-client";
import { ApiResponse } from "@crypto.com/developer-platform-client/dist/integrations/api.interfaces";
import { ContractCode } from "@crypto.com/developer-platform-client/dist/lib/client/interfaces/contract.interfaces";
import {
  LookupAddress,
  ResolveName,
} from "@crypto.com/developer-platform-client/dist/lib/client/interfaces/cronosid.interfaces";
import { Farm } from "@crypto.com/developer-platform-client/dist/lib/client/interfaces/defi.interfaces";
import { TickerData } from "@crypto.com/developer-platform-client/dist/lib/client/interfaces/exchange.interfaces";
import {
  TransactionCount,
  TransactionStatus,
} from "@crypto.com/developer-platform-client/dist/lib/client/interfaces/transaction.interfaces";
import {
  getQuote,
  LiFiStep,
  ChainType,
  getChains,
  ExtendedChain,
  getToken,
  TokenExtended,
  getTokens,
} from "@lifi/sdk";
import { SimulationResult } from "../types";

export const getAvailablePools = async (
  protocol: "vvs" | "h2",
): Promise<ApiResponse<Farm[]>> => {
  const farmProtocol = protocol === "vvs" ? DefiProtocol.VVS : DefiProtocol.H2;
  const farms = await Defi.getAllFarms(farmProtocol);
  return farms;
};

export const checkIfTokenIsWhitelistedOnProtocol = async (
  protocol: "vvs" | "h2",
  tokenAddress: string,
): Promise<boolean> => {
  try {
    const farmProtocol =
      protocol === "vvs" ? DefiProtocol.VVS : DefiProtocol.H2;
    const tokens = await Defi.getWhitelistedTokens(farmProtocol);
    return tokens.data.some(
      (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
  } catch (error) {
    console.error(
      `Error checking if token ${tokenAddress} is whitelisted on protocol ${protocol}:`,
      error,
    );
    throw error;
  }
};

export const getErc20TokenBalance = async (
  walletAddress: string,
  tokenAddress: string,
): Promise<ApiResponse<{ balance: string }>> => {
  try {
    const balance = await Token.getERC20TokenBalance(
      walletAddress,
      tokenAddress,
    );
    return balance;
  } catch (error) {
    console.error(
      `Error fetching ERC20 token balance for wallet ${walletAddress} and token ${tokenAddress}:`,
      error,
    );
    throw error;
  }
};

export const getTxnByHash = async (
  txnHash: string,
): Promise<ApiResponse<Transaction>> => {
  try {
    const txn = await Transaction.getTransactionByHash(txnHash);
    return txn;
  } catch (error) {
    console.error(`Error fetching transaction for hash ${txnHash}:`, error);
    throw error;
  }
};

export const getTxnStatusByHash = async (
  txnHash: string,
): Promise<ApiResponse<TransactionStatus>> => {
  try {
    const txnStatus = await Transaction.getTransactionStatus(txnHash);
    return txnStatus;
  } catch (error) {
    console.error(
      `Error fetching transaction status for hash ${txnHash}:`,
      error,
    );
    throw error;
  }
};

export const getTxnCountByAddress = async (
  walletAddress: string,
): Promise<ApiResponse<TransactionCount>> => {
  try {
    const txnCount = await Transaction.getTransactionCount(walletAddress);
    return txnCount;
  } catch (error) {
    console.error(
      `Error fetching transaction count for address ${walletAddress}:`,
      error,
    );
    throw error;
  }
};

export const getContractAbi = async (
  contractAddress: string,
): Promise<ApiResponse<ContractCode>> => {
  try {
    const contractAbi = await Contract.getContractCode(contractAddress);
    return contractAbi;
  } catch (error) {
    console.error(
      `Error fetching contract ABI for address ${contractAddress}:`,
      error,
    );
    throw error;
  }
};

export const validateCronosId = (identifier: string): boolean => {
  try {
    const isValid = CronosId.isCronosId(identifier);
    return isValid;
  } catch (error) {
    console.error(
      `Error validating Cronos ID for identifier ${identifier}:`,
      error,
    );
    throw error;
  }
};

export const resolveCronosIdToAddress = async (
  cronosId: string,
): Promise<ApiResponse<ResolveName>> => {
  try {
    const addressResponse = await CronosId.forwardResolve(cronosId);
    return addressResponse;
  } catch (error) {
    console.error(`Error resolving Cronos ID ${cronosId} to address:`, error);
    throw error;
  }
};

export const resolveAddressToCronosId = async (
  address: string,
): Promise<ApiResponse<LookupAddress>> => {
  try {
    const cronosIdResponse = await CronosId.reverseResolve(address);
    return cronosIdResponse;
  } catch (error) {
    console.error(`Error resolving address ${address} to Cronos ID:`, error);
    throw error;
  }
};

export const getWalletAddressOrCronosIdBalance = async (
  identifier: string,
): Promise<ApiResponse<{ balance: string }>> => {
  try {
    const balance = await Wallet.balance(identifier);
    return balance;
  } catch (error) {
    console.error(
      `Error fetching balance for identifier ${identifier}:`,
      error,
    );
    throw error;
  }
};

export const getFarmBySymbol = async (
  protocol: "vvs" | "h2",
  symbol: string,
): Promise<ApiResponse<Farm> | null> => {
  try {
    const farmProtocol =
      protocol === "vvs" ? DefiProtocol.VVS : DefiProtocol.H2;
    const farm = await Defi.getFarmBySymbol(farmProtocol, symbol);
    if (!farm.data) {
      return null;
    }
    return farm;
  } catch (error) {
    console.error(`Error fetching farm for symbol ${symbol}:`, error);
    throw error;
  }
};

export const getAllTickers = async (): Promise<ApiResponse<TickerData[]>> => {
  try {
    const ticker = await Exchange.getAllTickers();
    return ticker;
  } catch (error) {
    console.error("Error fetching tickers:", error);
    throw error;
  }
};

export const getTickerByInstrument = async (
  instrument: string,
): Promise<ApiResponse<TickerData>> => {
  try {
    const ticker = await Exchange.getTickerByInstrument(instrument);
    return ticker;
  } catch (error) {
    console.error(`Error fetching ticker for instrument ${instrument}:`, error);
    throw error;
  }
};

export const getBestBridgeRoute = async (
  fromChainId: string,
  toChainId: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string,
): Promise<LiFiStep> => {
  try {
    if (
      !fromAddress ||
      !fromAddress.startsWith("0x") ||
      fromAddress.length !== 42
    ) {
      throw new Error(
        "Invalid wallet address. Must be a valid 0x-prefixed 42-character Ethereum address.",
      );
    }

    const quote = await getQuote({
      fromAddress: fromAddress,
      fromChain: parseInt(fromChainId),
      toChain: parseInt(toChainId),
      fromToken: fromToken,
      toToken: toToken,
      fromAmount: fromAmount,
    });
    return quote;
  } catch (error) {
    console.error("Error fetching best bridge route:", error);
    throw error;
  }
};

export const getSupportedChains = async (): Promise<ExtendedChain[]> => {
  try {
    const chains = await getChains({ chainTypes: [ChainType.EVM] });
    return chains;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTokenDetails = async (
  chainId: number,
  tokenAddress: string,
): Promise<TokenExtended> => {
  try {
    const token = await getToken(chainId, tokenAddress);
    return token;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getChainTokenBySymbol = async (
  chainId: number,
  tokenSymbol: string,
): Promise<TokenExtended | null> => {
  try {
    const tokens = await getTokens({
      chains: [chainId],
      extended: true,
    });
    const chainTokens = tokens.tokens[chainId];
    if (!chainTokens) {
      return null;
    }
    const token = chainTokens.find(
      (t) => t.symbol.toLowerCase() === tokenSymbol.toLowerCase(),
    );
    return token || null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

type JsonRpcError = { code: number; message: string; data?: unknown };
type JsonRpcResponse<T> = {
  jsonrpc: string;
  id: number | string | null;
  result?: T;
  error?: JsonRpcError;
};

const rpcCall = async <T>(
  rpcUrl: string,
  method: string,
  params: unknown[],
): Promise<T> => {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    throw new Error(`RPC call failed with status ${res.status}`);
  }
  const json = (await res.json()) as JsonRpcResponse<T>;
  if (json.error) {
    const msg = json.error.message || "RPC Error";
    const data = json.error.data ? ` (${JSON.stringify(json.error.data)})` : "";
    throw new Error(`${msg}${data}`);
  }
  return json.result as T;
};

export const simulateTransaction = async (
  from: string,
  to: string,
  data: string,
  value: string = "0x0",
): Promise<SimulationResult> => {
  const rpcUrl = process.env.FORK_RPC_URL || "http://127.0.0.1:8545";

  const tx = {
    from,
    to,
    data,
    value,
  } as const;

  try {
    const gasEstimate = await rpcCall<string>(rpcUrl, "eth_estimateGas", [tx]);

    const callResult = await rpcCall<string>(rpcUrl, "eth_call", [
      tx,
      "latest",
    ]);

    return {
      success: true,
      gasEstimate,
      returnData: callResult,
      assetDeltas: [],
    };
  } catch (error: any) {
    const message = (error as Error).message || "Unknown error";
    return {
      success: false,
      gasEstimate: null,
      revertReason: message,
      assetDeltas: [],
    };
  }
};
