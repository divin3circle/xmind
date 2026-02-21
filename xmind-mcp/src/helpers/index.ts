import { ethers } from "ethers";

export type SimulationResult = {
  success: boolean;
  gasEstimate: string | null;
  returnData: string | null;
  revertReason?: string;
  assetDeltas: any[];
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
  // Use Avalanche Fuji RPC for simulation if local fork not available
  const rpcUrl = process.env.FORK_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

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
      returnData: null,
      revertReason: message,
      assetDeltas: [],
    };
  }
};
