import { Button } from "@/components/ui/button";
import { IconCopy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function AgentNotFound({ agentId }: { agentId: string }) {
  const router = useRouter();
  return (
    <div className="h-[90vh] flex items-center justify-center flex-col">
      <p className="text-muted-foreground text-sm ">Agent not found</p>
      <p className="flex items-center gap-1 mb-4 text-[11px] justify-center text-muted-foreground font-semibold">
        {agentId.slice(0, 6)}...{agentId.slice(-4)}
        <IconCopy
          size={12}
          className="cursor-pointer hover:scale-95 duration-200 ease-in"
        />
      </p>
      <Button onClick={() => router.push("/agents")}>Back to Agents</Button>
    </div>
  );
}
