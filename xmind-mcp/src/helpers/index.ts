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
import { ethers } from "ethers";
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
import { MainnetBalances, SimulationResult } from "../types";

export type X402PaymentRequirements = {
  scheme: string;
  network: string;
  payTo: string;
  asset: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
  description?: string;
  mimeType?: string;
};

const X402_FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ||
  "https://facilitator.cronoslabs.org/v2/x402";
const X402_SELLER_WALLET = "0x28eEE4B42810A2E138Dc41ef00901e93Fb88a19a";
const X402_USDCE_TESTNET = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";

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
): Promise<{ data: { balance: string }; message: string }> => {
  try {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org/");

    const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
    ];

    const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const balanceInWei = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();

    const balanceFormatted = ethers.formatUnits(balanceInWei, decimals);

    return {
      data: { balance: balanceFormatted },
      message: "Success",
    };
  } catch (error) {
    console.error(
      `Error fetching ERC20 token balance for wallet ${walletAddress} and token ${tokenAddress}:`,
      error,
    );
    throw error;
  }
};

export const getMainnetWalletBalance = async ({
  walletAddress,
}: {
  walletAddress: string;
}): Promise<MainnetBalances> => {
  try {
    const croBalance = await Wallet.balance(walletAddress);
    const usdcBalance = await Token.getERC20TokenBalance(
      walletAddress,
      "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
    );

    return {
      cro: croBalance.data.balance,
      usdc: usdcBalance.data.balance,
    };
  } catch (error) {
    console.error(
      `Error fetching mainnet wallet balance for address ${walletAddress}:`,
      error,
    );
    throw error;
  }
};

export const getDefaultSellerPaymentRequirements =
  (): X402PaymentRequirements => ({
    scheme: "exact",
    network: "cronos-testnet",
    payTo: X402_SELLER_WALLET,
    asset: X402_USDCE_TESTNET,
    description: "Access paid farm pools",
    mimeType: "application/json",
    // 0.1 USDC.e (6 decimals)
    maxAmountRequired: "100000",
    maxTimeoutSeconds: 300,
  });

export const sendTokenTransaction = async (
  fromPrivateKey: string,
  toAddress: string,
  tokenAddress: string,
  amount: string,
) => {
  try {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org/");
    const wallet = new ethers.Wallet(fromPrivateKey, provider);

    const erc20Abi = [
      "function decimals() view returns (uint8)",
      "function transfer(address to, uint256 amount) returns (bool)",
    ];

    const contract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const txResponse = await contract.transfer(toAddress, amountInWei);
    const receipt = await txResponse.wait();

    return {
      transactionHash: txResponse.hash,
      receipt,
    };
  } catch (error) {
    console.error(
      `Error sending token transaction from private key to address ${toAddress}:`,
      error,
    );
    throw error;
  }
};

const toBase64 = (value: string): string => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value).toString("base64");
  }
  if (typeof btoa !== "undefined") {
    return btoa(value);
  }
  throw new Error("Base64 encoding is not available in this environment");
};

export type X402VerificationResult = {
  isValid: boolean;
  settled: boolean;
  txHash?: string;
  invalidReason?: string;
  settleError?: string;
  rawVerify?: unknown;
  rawSettle?: unknown;
};

export const verifyAndSettleX402Payment = async ({
  paymentHeader,
  paymentRequirements,
  facilitatorUrl = X402_FACILITATOR_URL,
}: {
  paymentHeader: string;
  paymentRequirements: X402PaymentRequirements;
  facilitatorUrl?: string;
}): Promise<X402VerificationResult> => {
  const payload = {
    x402Version: 1,
    paymentHeader,
    paymentRequirements,
  } as const;

  const headers = {
    "Content-Type": "application/json",
    "X402-Version": "1",
  } as const;

  try {
    const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const verifyJson = (await verifyRes.json()) as {
      isValid?: boolean;
      invalidReason?: string;
      [key: string]: unknown;
    };

    if (!verifyRes.ok || verifyJson?.isValid === false) {
      return {
        isValid: false,
        settled: false,
        invalidReason:
          verifyJson?.invalidReason ||
          verifyRes.statusText ||
          "Invalid payment",
        rawVerify: verifyJson,
      };
    }

    const settleRes = await fetch(`${facilitatorUrl}/settle`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const settleJson = (await settleRes.json()) as {
      event?: string;
      txHash?: string;
      error?: string;
      [key: string]: unknown;
    };
    const settled = settleJson?.event === "payment.settled";

    return {
      isValid: true,
      settled,
      txHash: settleJson?.txHash,
      settleError: settled ? undefined : settleJson?.error,
      rawVerify: verifyJson,
      rawSettle: settleJson,
    };
  } catch (error) {
    console.error("Error verifying/settling X402 payment:", error);
    throw error;
  }
};

export const handleX402Payment = async ({
  resourceUrl,
  privateKey,
  method = "GET",
  requestData,
}: {
  resourceUrl: string;
  privateKey: string;
  method?: string;
  requestData?: unknown;
}): Promise<unknown> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (requestData && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(requestData);
    }

    let response = await fetch(resourceUrl, options);

    if (response.status !== 402) {
      return response.json();
    }

    const responseData = (await response.json()) as {
      paymentRequirements?: X402PaymentRequirements;
    };
    const { paymentRequirements } = responseData;

    if (!paymentRequirements) {
      throw new Error("No paymentRequirements in 402 response");
    }

    const paymentHeader = await createX402PaymentHeader({
      privateKey,
      paymentRequirements,
    });

    const retryOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        "X-PAYMENT": paymentHeader,
      },
    };

    response = await fetch(resourceUrl, retryOptions);

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error handling X402 payment flow:", error);
    throw error;
  }
};

export const createX402PaymentHeader = async ({
  privateKey,
  paymentRequirements,
  rpcUrl = "https://evm-t3.cronos.org/",
}: {
  privateKey: string;
  paymentRequirements: X402PaymentRequirements;
  rpcUrl?: string;
}): Promise<string> => {
  try {
    let {
      payTo,
      asset,
      maxAmountRequired,
      maxTimeoutSeconds,
      scheme,
      network,
    } = paymentRequirements;

    // Normalize network string: "Cronos Testnet" → "cronos-testnet"
    network = network
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace("testnet", "testnet");

    if (!ethers.isAddress(payTo)) {
      throw new Error("Invalid payTo address in payment requirements");
    }

    if (!ethers.isAddress(asset)) {
      throw new Error("Invalid asset address in payment requirements");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const chain = await provider.getNetwork();
    const chainId = Number(chain.chainId);

    const now = Math.floor(Date.now() / 1000);
    const validAfter = 0;
    const validBefore = now + (maxTimeoutSeconds ?? 300);
    const nonce = ethers.hexlify(ethers.randomBytes(32));

    const domain = {
      name: "Bridged USDC (Stargate)",
      version: "1",
      chainId,
      verifyingContract: asset,
    } as const;

    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    const messageToSign = {
      from: wallet.address,
      to: payTo,
      value: BigInt(maxAmountRequired),
      validAfter,
      validBefore,
      nonce,
    } as const;

    const signature = await wallet.signTypedData(domain, types, messageToSign);

    const paymentHeader = {
      x402Version: 1,
      scheme,
      network,
      payload: {
        ...messageToSign,
        value: maxAmountRequired,
        signature,
        asset,
      },
    };

    const headerJson = JSON.stringify(paymentHeader);
    return toBase64(headerJson);
  } catch (error) {
    console.error("Error creating X402 payment header:", error);
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
): Promise<{ data: { balance: string }; message: string }> => {
  try {
    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org/");
    const balanceInWei = await provider.getBalance(identifier);
    const balanceInCro = ethers.formatEther(balanceInWei);

    return {
      data: { balance: balanceInCro },
      message: "Success",
    };
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
