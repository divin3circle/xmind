import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ConnectWalletPrompt() {
  const router = useRouter();
  return (
    <div className="h-[90vh] flex items-center justify-center flex-col">
      <p className="text-muted-foreground text-sm mb-4">
        Please connect your wallet to chat with this agent
      </p>
      <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
    </div>
  );
}
