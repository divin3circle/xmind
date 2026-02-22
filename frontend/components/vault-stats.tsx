"use client";

import { IVaultAgent } from "@/lib/types/vault";
import { IconCoins, IconTrendingUp, IconActivity } from "@tabler/icons-react";
import { useVault } from "@/hooks/useVault";

export function VaultStats({ vault }: { vault: IVaultAgent }) {
  const { totalAssets, tokenDecimals } = useVault(vault.vaultAddress, vault.underlyingToken);

  // Format real TVL using decimals if fetched, otherwise fallback to 0
  const tvlFormatted =
    totalAssets && tokenDecimals
      ? (Number(totalAssets) / 10 ** tokenDecimals).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : "0.00";

  const vaultYield = "+12.4% APY (7d Avg)";
  const mockStatus = vault.tradingEnabled ? "Active & Trading" : "Paused";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-5xl">
      <div className="flex flex-col gap-2 p-4 border border-dashed hover:bg-muted/10 transition-colors">
        <div className="flex items-center text-muted-foreground gap-2">
          <IconCoins className="w-4 h-4" />
          <h3 className="text-xs uppercase font-semibold">Total Value Locked</h3>
        </div>
        <p className="text-2xl font-bold font-mono tracking-tighter">{tvlFormatted}</p>
      </div>
      <div className="flex flex-col gap-2 p-4 border border-dashed hover:bg-green-500/5 transition-colors">
        <div className="flex items-center text-green-500 gap-2">
          <IconTrendingUp className="w-4 h-4" />
          <h3 className="text-xs uppercase font-semibold">Vault Performance</h3>
        </div>
        <p className="text-2xl text-green-500 font-bold font-mono tracking-tighter">{vaultYield}</p>
      </div>
      <div className="flex flex-col gap-2 p-4 border border-dashed hover:bg-muted/10 transition-colors">
        <div className="flex items-center text-muted-foreground gap-2">
          <IconActivity className="w-4 h-4" />
          <h3 className="text-xs uppercase font-semibold">AI Oracle Status</h3>
        </div>
        <p className="text-lg font-semibold tracking-tight">{mockStatus}</p>
        <p className="text-[10px] text-muted-foreground font-mono">Real-time sync via CRE</p>
      </div>
    </div>
  );
}
