/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import axios from "axios";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<string[] | unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        callback: (...args: unknown[]) => void,
      ) => void;
    };
  }
}

export {};

interface PaymentRequirements {
  scheme: string;
  network: string;
  payTo: string;
  asset: string;
  description: string;
  mimeType: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
}

interface UseX402Return {
  payForResource: (resourceUrl: string) => Promise<any>;
  isPending: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
  lastResponse: any;
}

export function useX402(): UseX402Return {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const payForResource = useCallback(
    async (resourceUrl: string): Promise<any> => {
      setIsPending(true);
      setError(null);
      setIsError(false);
      setIsSuccess(false);
      setLastResponse(null);

      try {
        let initialResponse: any;
        try {
          const response = await axios.get(resourceUrl);
          initialResponse = { status: response.status, data: response.data };
        } catch (err: any) {
          initialResponse = {
            status: err.response?.status,
            data: err.response?.data,
          };
        }

        if (initialResponse.status !== 402) {
          setIsPending(false);
          return initialResponse.data;
        }

        const { paymentRequirements } = initialResponse.data;

        if (!window.ethereum) {
          throw new Error(
            "MetaMask is not installed. Please install MetaMask to make payments.",
          );
        }

        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as string[];

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts available from MetaMask");
        }

        const userAddress = accounts[0];

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const paymentHeader = await createPaymentHeader({
          signer,
          provider,
          paymentRequirements,
          userAddress,
        });

        const paidResponse = await axios.get(resourceUrl, {
          headers: { "X-PAYMENT": paymentHeader },
        });

        setIsSuccess(true);
        setLastResponse(paidResponse.data);
        setIsPending(false);
        return paidResponse.data;
      } catch (err: any) {
        const error = new Error(
          err.response?.data?.error ||
            err.message ||
            "Failed to process payment",
        );
        setError(error);
        setIsError(true);
        setIsPending(false);
        setIsSuccess(false);
        throw error;
      }
    },
    [],
  );

  return { payForResource, isPending, error, isError, isSuccess, lastResponse };
}

async function createPaymentHeader({
  signer,
  provider,
  paymentRequirements,
  userAddress,
}: {
  signer: ethers.Signer;
  provider: ethers.BrowserProvider;
  paymentRequirements: PaymentRequirements;
  userAddress: string;
}): Promise<string> {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    const now = Math.floor(Date.now() / 1000);
    const validAfter = 0;
    const validBefore = now + (paymentRequirements.maxTimeoutSeconds || 300);
    const nonce = ethers.hexlify(ethers.randomBytes(32));

    const domain = {
      name: "Bridged USDC (Stargate)",
      version: "1",
      chainId,
      verifyingContract: paymentRequirements.asset,
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
    } as const;

    const messageToSign = {
      from: userAddress,
      to: paymentRequirements.payTo,
      value: BigInt(paymentRequirements.maxAmountRequired),
      validAfter,
      validBefore,
      nonce,
    } as const;

    const messageForHeader = {
      from: userAddress,
      to: paymentRequirements.payTo,
      value: paymentRequirements.maxAmountRequired,
      validAfter,
      validBefore,
      nonce,
    } as const;

    const signature = await (signer as any).signTypedData(
      domain,
      types,
      messageToSign,
    );

    const paymentHeader = {
      x402Version: 1,
      scheme: paymentRequirements.scheme,
      network: paymentRequirements.network,
      payload: {
        from: userAddress,
        to: paymentRequirements.payTo,
        value: messageForHeader.value,
        validAfter,
        validBefore,
        nonce,
        signature,
        asset: paymentRequirements.asset,
      },
    };

    const paymentHeaderJson = JSON.stringify(paymentHeader);
    const paymentHeaderBase64 =
      Buffer.from(paymentHeaderJson).toString("base64");

    return paymentHeaderBase64;
  } catch (error: any) {
    throw new Error(`Failed to create payment header: ${error.message}`);
  }
}
