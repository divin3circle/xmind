"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNavbar from "../../dashboard/navbar";
import { VaultStats } from "@/components/vault-stats";
import { VaultActions } from "@/components/vault-actions";
import { IVaultAgent } from "@/lib/types/vault";
import { IconArrowLeft, IconExternalLink, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

function VaultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vault, setVault] = useState<IVaultAgent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const res = await fetch(`/api/vault/details?id=${id}`);
        const data = await res.json();
        if (data.success) {
          setVault(data.vault);
        }
      } catch (e) {
        console.error("Failed to fetch vault details", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVault();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl relative mx-auto my-0">
        <DashboardNavbar />
        <div className="flex w-full min-h-[500px] items-center justify-center text-muted-foreground">
          <IconLoader2 className="animate-spin mr-2" /> Loading Vault Data...
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="max-w-7xl relative mx-auto my-0">
        <DashboardNavbar />
        <div className="flex w-full min-h-[500px] items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground font-sans">Vault not found or access denied.</p>
          <Button variant="outline" onClick={() => router.push("/agents")}>Return to Directory</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl relative mx-auto my-0 pb-20">
      <DashboardNavbar />
      <div className="flex flex-col px-4 md:px-8 mt-8">
        
        {/* Header & Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/agents")} className="border border-dashed">
            <IconArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-sans tracking-tight">{vault.name}</h1>
            <a 
              href={`https://testnet.snowtrace.io/address/${vault.vaultAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted-foreground flex items-center hover:text-green-500 transition-colors"
            >
              {vault.vaultAddress} <IconExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 text-xs font-sans">
          <div className="p-3 border border-dashed text-muted-foreground">
            <span className="font-semibold text-foreground block mb-1">Risk Profile</span>
            <span className="uppercase">{vault.riskProfile}</span>
          </div>
          <div className="p-3 border border-dashed text-muted-foreground">
            <span className="font-semibold text-foreground block mb-1">Strategy</span>
            <span className="truncate block" title={vault.strategyDescription}>{vault.strategyDescription}</span>
          </div>
          <div className="p-3 border border-dashed text-muted-foreground">
            <span className="font-semibold text-foreground block mb-1">Base Asset ID</span>
            <span className="truncate block" title={vault.underlyingToken}>{vault.underlyingToken}</span>
          </div>
          <div className="p-3 border border-dashed text-green-500/80 bg-green-500/5">
            <span className="font-semibold text-green-500 block mb-1">AI Oracle</span>
            <span>Gemini via Chainlink CRE</span>
          </div>
        </div>

        {/* Financial Components */}
        <h2 className="text-lg font-semibold mb-4 mt-4 font-sans border-b border-dashed pb-2 w-full max-w-5xl">Vault Analytics</h2>
        <VaultStats vault={vault} />

        <h2 className="text-lg font-semibold mb-4 mt-8 font-sans border-b border-dashed pb-2 w-full max-w-5xl">Manage Position</h2>
        <VaultActions vault={vault} />

        {/* Placeholder for Timeline/Execution Logs */}
        <h2 className="text-lg font-semibold mb-4 mt-12 font-sans border-b border-dashed pb-2 w-full max-w-5xl">AI Execution Logs</h2>
        <div className="w-full max-w-5xl border border-dashed p-8 bg-muted/10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
          <p>No recent execution logs.</p>
          <p className="mt-2 text-[10px] opacity-70">The Chainlink CRE Runtime will append thought processes and swap receipts here.</p>
        </div>

      </div>
    </div>
  );
}

export default VaultPage;
