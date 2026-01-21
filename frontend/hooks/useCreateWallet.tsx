import axios from "axios";
import React from "react";
import { toast } from "sonner";

export interface WalletCreated {
  status: string;
  data: {
    address: string;
    privateKey: string;
    mnemonic: string;
  };
}

export const useCreateWallet = () => {
  const [createdWallet, setCreatedWallet] =
    React.useState<WalletCreated | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const createNewWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await axios.post<WalletCreated>("/api/wallet");
      const wallet = data.data;
      setCreatedWallet({
        status: "success",
        data: {
          address: wallet.data.address,
          privateKey: wallet.data.privateKey,
          mnemonic: wallet.data.mnemonic || "",
        },
      });
      toast.success("Wallet created successfully");
      return wallet;
    } catch (err) {
      setError("Failed to create wallet");
      toast.error("Failed to create wallet: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { createdWallet, loading, error, createNewWallet };
};
