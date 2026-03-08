"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IVaultAgent } from "@/lib/types/vault";
import { IconArrowDown, IconArrowUp, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import { useVault } from "@/hooks/useVault";

export function VaultActions({ vault }: { vault: IVaultAgent }) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const activeAccount = useActiveAccount();
  const { deposit, withdraw, isProcessing, userVaultShares, userBalance, tokenDecimals } = useVault(vault.vaultAddress, vault.underlyingToken);

  const handleDeposit = async () => {
    if (!activeAccount) return toast.error("Connect wallet to interact with Vault");
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      return toast.error("Enter a valid deposit amount");
    }

    try {
      const receipt = await deposit(depositAmount);
      toast.success(`Deposited ${depositAmount} tokens cleanly into ${vault.name}. Tx: ${receipt.transactionHash.slice(0,6)}...`);
      setDepositAmount("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to finalize deposit parameters");
    }
  };

  const handleWithdraw = async () => {
    if (!activeAccount) return toast.error("Connect wallet to interact with Vault");
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      return toast.error("Enter a valid withdraw share amount");
    }

    try {
      const receipt = await withdraw(withdrawAmount);
      toast.success(`Withdrew ${withdrawAmount} LP shares directly back to underlying base asset. Tx: ${receipt.transactionHash.slice(0,6)}...`);
      setWithdrawAmount("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to finalize withdraw parameters");
    }
  };

  const formattedBalance = userBalance && tokenDecimals ? (Number(userBalance) / 10 ** tokenDecimals).toFixed(4) : "0.0000";
  const formattedShares = userVaultShares && tokenDecimals ? (Number(userVaultShares) / 10 ** tokenDecimals).toFixed(4) : "0.0000";

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl">
      <div className="flex-1 border border-dashed p-6 items-center flex flex-col">
        <IconArrowDown className="text-green-500 w-8 h-8 mb-4 border border-dashed p-1 rounded-full border-green-500" />
        <h3 className="text-sm font-semibold mb-2">Deposit Capital</h3>
        <p className="text-[10px] text-muted-foreground text-center mb-4">
          Deposit your Fuji Testnet tokens. Balance: <span className="font-mono text-foreground font-bold">{formattedBalance}</span>
        </p>
        <div className="flex w-full gap-2">
          <Input 
            placeholder="0.0" 
            type="number" 
            value={depositAmount} 
            onChange={(e) => setDepositAmount(e.target.value)} 
            className="border-dashed bg-background"
          />
          <Button 
            disabled={isProcessing} 
            onClick={handleDeposit} 
            className="bg-green-600 hover:bg-green-700 text-white font-sans w-24"
          >
            {isProcessing ? <IconLoader2 className="animate-spin w-4 h-4" /> : "Deposit"}
          </Button>
        </div>
      </div>

      <div className="flex-1 border border-dashed p-6 items-center flex flex-col">
        <IconArrowUp className="text-red-500 w-8 h-8 mb-4 border border-dashed p-1 rounded-full border-red-500" />
        <h3 className="text-sm font-semibold mb-2">Withdraw Position</h3>
        <p className="text-[10px] text-muted-foreground text-center mb-4">
          Redeem LP shares. Wallet Shares: <span className="font-mono text-foreground font-bold">{formattedShares}</span>
        </p>
        <div className="flex w-full gap-2">
          <Input 
            placeholder="0.0" 
            type="number" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)} 
            className="border-dashed bg-background"
          />
          <Button 
            variant="outline"
            disabled={isProcessing} 
            onClick={handleWithdraw} 
            className="border-red-500 text-red-500 hover:bg-red-500/10 border-dashed font-sans w-24"
          >
            {isProcessing ? <IconLoader2 className="animate-spin w-4 h-4" /> : "Withdraw"}
          </Button>
        </div>
      </div>
    </div>
  );
}
