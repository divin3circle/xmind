"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Loader2 } from "lucide-react";

interface SheetDetailsProps {
  agentId?: string;
}

export function SheetDetails({ agentId }: SheetDetailsProps) {
  const { agent, loading, error, refetch } = useAgentDetails(agentId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          Details
        </Button>
      </SheetTrigger>
      <SheetContent className="pl-2">
        <SheetHeader>
          <SheetTitle>Agent Actions</SheetTitle>
          <SheetDescription>See what you agent has been upto.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading agent...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={refetch}>
                Retry
              </Button>
            </div>
          )}

          {agent && (
            <div className="space-y-2 text-sm">
              <DetailRow label="Name" value={agent.name} />
              <DetailRow label="Description" value={agent.description} />
              <DetailRow
                label="Contract"
                value={agent.contractAddress}
                isMono
              />
              <DetailRow label="Creator" value={agent.creatorAddress} isMono />
              <DetailRow label="Tasks Ran" value={agent.tasksRan?.toString()} />
              <DetailRow
                label="Tasks Completed"
                value={agent.tasksCompleted?.toString()}
              />
              <DetailRow
                label="Total Earned"
                value={
                  agent.totalEarned !== undefined
                    ? `${agent.totalEarned} USDC.e`
                    : undefined
                }
              />
              <DetailRow label="Created" value={agent.createdAt || ""} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  label,
  value,
  isMono,
}: {
  label: string;
  value?: string;
  isMono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground min-w-[120px]">
        {label}
      </span>
      <span className={`text-sm ${isMono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
