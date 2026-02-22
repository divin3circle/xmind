"use client";

import { IVaultAgent } from "@/lib/types/vault";
import { IconCoins, IconTrendingUp, IconActivity } from "@tabler/icons-react";

export function VaultStats({ vault }: { vault: IVaultAgent }) {
  // In a real app we'd fetch this from ethers.js / thirdweb useReadContract
  // Mocking for the UI review phase.
  const mockTvl = "1,245.50 USDC";
  const mockYield = "+12.4% APY (7d Avg)";
  const mockStatus = vault.tradingEnabled ? "Active & Trading" : "Paused";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-5xl">
      <div className="flex flex-col gap-2 p-4 border border-dashed hover:bg-muted/10 transition-colors">
        <div className="flex items-center text-muted-foreground gap-2">
          <IconCoins className="w-4 h-4" />
          <h3 className="text-xs uppercase font-semibold">Total Value Locked</h3>
        </div>
        <p className="text-2xl font-bold font-mono tracking-tighter">{mockTvl}</p>
      </div>
      <div className="flex flex-col gap-2 p-4 border border-dashed hover:bg-green-500/5 transition-colors">
        <div className="flex items-center text-green-500 gap-2">
          <IconTrendingUp className="w-4 h-4" />
          <h3 className="text-xs uppercase font-semibold">Vault Performance</h3>
        </div>
        <p className="text-2xl text-green-500 font-bold font-mono tracking-tighter">{mockYield}</p>
      </div>
      <div className="flex flex-col gap-2 p-4 border border-dashed hover:bg-muted/10 transition-colors">
        <div className="flex items-center text-muted-foreground gap-2">
          <IconActivity className="w-4 h-4" />
          <h3 className="text-xs uppercase font-semibold">AI Oracle Status</h3>
        </div>
        <p className="text-lg font-semibold tracking-tight">{mockStatus}</p>
        <p className="text-[10px] text-muted-foreground font-mono">Last tick: 4m ago</p>
      </div>
    </div>
  );
}
