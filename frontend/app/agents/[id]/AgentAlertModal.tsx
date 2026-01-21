import Image from "next/image";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Agent } from "@/lib/utils";
import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

interface AgentAlertModalProps {
  agent: Agent;
}

export function AgentAlertModal({ agent }: AgentAlertModalProps) {
  const handleCopyAddress = (address: string, label: string) => {
    navigator.clipboard.writeText(address);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  console.log("Agent in Modal:", agent);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="border-none bg-background text-foreground/50 hover:underline cursor-pointer">
          See More
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="items-center gap-3 mb-4 flex flex-col md:flex-row">
            <div className="border border-dashed p-1">
              <Image
                src={agent.image}
                alt={agent.name}
                width={100}
                height={100}
                className="w-24 h-24 object-cover"
              />
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg">{agent.name}</h2>
              <p className="text-xs text-muted-foreground font-normal">
                {agent.description}
              </p>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-4 border-y border-dashed">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 border border-dashed rounded">
              <p className="font-sans text-base font-semibold">
                {agent.tasks?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground"> Tasks</p>
            </div>
            <div className="flex flex-col items-center p-3 border border-dashed rounded">
              <p className="font-sans text-base font-semibold">
                {agent.totalEarned?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-muted-foreground"> Balance</p>
            </div>
            <div className="flex flex-col items-center p-3 border border-dashed rounded">
              <p className="font-sans text-base font-semibold">
                {agent.actions?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Actions </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {agent.contractAddress && (
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-dashed">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Smart Contract Address
                  </p>
                  <p className="font-sans text-xs">
                    {truncateAddress(agent.contractAddress)}
                  </p>
                </div>
                <IconCopy
                  size={16}
                  className="cursor-pointer hover:scale-110 transition"
                  onClick={() =>
                    handleCopyAddress(
                      agent.contractAddress!,
                      "Contract address",
                    )
                  }
                />
              </div>
            )}

            {agent.creatorAddress && (
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-dashed">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Creator Address
                  </p>
                  <p className="font-sans text-xs">
                    {truncateAddress(agent.creatorAddress)}
                  </p>
                </div>
                <IconCopy
                  size={16}
                  className="cursor-pointer hover:scale-110 transition"
                  onClick={() =>
                    handleCopyAddress(agent.creatorAddress, "Creator address")
                  }
                />
              </div>
            )}

            {agent.walletAddress && (
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-dashed">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Agent Wallet Address
                  </p>
                  <p className="font-sans text-xs">
                    {truncateAddress(agent.walletAddress)}
                  </p>
                </div>
                <IconCopy
                  size={16}
                  className="cursor-pointer hover:scale-110 transition"
                  onClick={() =>
                    handleCopyAddress(agent.walletAddress!, "Wallet address")
                  }
                />
              </div>
            )}

            {agent.createdAt && (
              <div className="p-2 bg-muted/30 rounded border border-dashed">
                <p className="text-xs font-semibold text-muted-foreground">
                  Created
                </p>
                <p className="font-sans text-xs">
                  {formatDate(agent.createdAt)}
                </p>
              </div>
            )}

            <div className="p-2 bg-muted/30 rounded border border-dashed">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                {agent.geminiKey ? "API Key Status" : "System Prompt"}
              </p>
              {agent.geminiKey ? (
                <p className="text-xs text-green-600/70 font-medium">
                  ✓ API Key Configured
                </p>
              ) : agent.systemPrompt ? (
                <p className="text-xs whitespace-pre-wrap wrap-break-word">
                  {agent.systemPrompt}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No system prompt
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <AlertDialogCancel>Close</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
