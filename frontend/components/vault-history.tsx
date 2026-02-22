"use client";

import { useEffect, useState } from "react";
import { IAgentAction } from "@/lib/models/AgentAction";
import { IconBrain, IconClock, IconLink, IconAlertCircle, IconCheck, IconLoader2 } from "@tabler/icons-react";

export function VaultHistory({ vaultAddress }: { vaultAddress: string }) {
  const [logs, setLogs] = useState<IAgentAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/cre/history?vaultAddress=${vaultAddress}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.actions);
      }
    } catch (e) {
      console.error("Failed to fetch CRE history", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vaultAddress) {
      fetchHistory();
      // Poll every 10 seconds for fresh CRE Orchestrator logs
      const interval = setInterval(fetchHistory, 10000);
      return () => clearInterval(interval);
    }
  }, [vaultAddress]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl border border-dashed py-12 flex justify-center text-muted-foreground">
        <IconLoader2 className="animate-spin w-5 h-5 mr-2" /> Connecting to CRE Node...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="w-full max-w-5xl border border-dashed p-8 bg-muted/10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
        <IconBrain className="w-6 h-6 mb-2 opacity-50" />
        <p>No recent execution logs.</p>
        <p className="mt-2 text-[10px] opacity-70">The Chainlink CRE Runtime will append thought processes and swap receipts here.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="relative border-l border-dashed border-muted-foreground/30 pl-6 ml-4 space-y-8 pb-4">
        {logs.map((log) => (
          <LogEntry key={log._id?.toString() || Math.random().toString()} log={log} />
        ))}
      </div>
    </div>
  );
}

function LogEntry({ log }: { log: IAgentAction }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongText = log.reasoning && log.reasoning.length > 200;

  return (
    <div className="relative">
      {/* Timeline node */}
      <div className="absolute -left-[35px] bg-background border border-dashed p-1 rounded-full">
        {log.status === "failed" ? (
          <IconAlertCircle className="w-4 h-4 text-red-500" />
        ) : log.status === "confirmed" ? (
          <IconCheck className="w-4 h-4 text-green-500" />
        ) : (
          <IconBrain className="w-4 h-4 text-blue-500" />
        )}
      </div>

      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex flex-col border border-dashed p-4 transition-all cursor-pointer ${
          isExpanded ? "bg-muted/10 border-blue-500/50" : "hover:bg-muted/5"
        }`}
      >
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-dashed">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase font-bold text-foreground">
              Action: {log.actionType}
            </span>
            <span className="text-[10px] uppercase border border-dashed px-1 py-0.5 text-muted-foreground">
              {log.status}
            </span>
          </div>
          <div className="flex items-center text-[10px] text-muted-foreground font-mono gap-1">
            <IconClock className="w-3 h-3" />
            {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Just now"}
          </div>
        </div>

        <div
          className={`text-sm font-sans text-muted-foreground whitespace-pre-wrap leading-relaxed transition-all ${
            !isExpanded ? "line-clamp-4" : ""
          }`}
        >
          {log.reasoning}
        </div>

        {!isExpanded && hasLongText && (
          <div className="mt-2 text-[10px] text-blue-400 font-mono animate-pulse uppercase">
            [+] Click to expand full AI reasoning
          </div>
        )}

        {isExpanded && log.txHash && (
          <a
            href={`https://testnet.snowtrace.io/tx/${log.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-4 flex items-center text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 self-start px-2 py-1 rounded-sm border border-blue-500/20"
          >
            <IconLink className="w-3 h-3 mr-1" />
            View Transaction Receipt
          </a>
        )}
      </div>
    </div>
  );
}
