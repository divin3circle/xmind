"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IVaultAgent } from "@/lib/types/vault";
import { IconArrowDown, IconArrowUp, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";

export function VaultActions({ vault }: { vault: IVaultAgent }) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const activeAccount = useActiveAccount();

  const handleTransaction = async (type: "deposit" | "withdraw") => {
    if (!activeAccount) return toast.error("Connect wallet to interact with Vault");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Enter a valid amount");
    }

    setIsProcessing(true);
    // Mocking the interaction for UI demonstration
    setTimeout(() => {
      setIsProcessing(false);
      setAmount("");
      toast.success(`${type === "deposit" ? "Deposited" : "Withdrew"} ${amount} token successfully to ${vault.name}.`);
    }, 2500);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl">
      <div className="flex-1 border border-dashed p-6 items-center flex flex-col">
        <IconArrowDown className="text-green-500 w-8 h-8 mb-4 border border-dashed p-1 rounded-full border-green-500" />
        <h3 className="text-sm font-semibold mb-2">Deposit Capital</h3>
        <p className="text-[10px] text-muted-foreground text-center mb-4">
          Deposit your Fuji Testnet tokens into this agent&apos;s vault. Funds are managed via Chainlink CRE.
        </p>
        <div className="flex w-full gap-2">
          <Input 
            placeholder="0.0" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="border-dashed bg-background"
          />
          <Button 
            disabled={isProcessing} 
            onClick={() => handleTransaction("deposit")} 
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
          Withdraw your LP tokens back to the underlying base asset. Subject to oracle settlement cooldowns.
        </p>
        <div className="flex w-full gap-2">
          <Input 
            placeholder="0.0" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="border-dashed bg-background"
          />
          <Button 
            variant="outline"
            disabled={isProcessing} 
            onClick={() => handleTransaction("withdraw")} 
            className="border-red-500 text-red-500 hover:bg-red-500/10 border-dashed font-sans w-24"
          >
            {isProcessing ? <IconLoader2 className="animate-spin w-4 h-4" /> : "Withdraw"}
          </Button>
        </div>
      </div>
    </div>
  );
}
