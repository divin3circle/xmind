import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Agent } from "@/lib/utils";
import { AgentAlertModal } from "./AgentAlertModal";

interface WelcomeScreenProps {
  agent: Agent;
  message: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  onBack: () => void;
}

export function WelcomeScreen({
  agent,
  message,
  onChange,
  onSend,
  isSending,
  onBack,
}: WelcomeScreenProps) {
  return (
    <div className="h-[90vh] flex items-center justify-center flex-col max-w-4xl mx-auto px-4">
      <div className="p-2 text-sm w-full flex items-center flex-col">
        <div className="border border-dashed p-2 mb-4">
          <Image
            src={agent.image}
            alt={agent.name}
            width={100}
            height={100}
            className="object-cover w-18 h-18"
          />
        </div>
        <p className="font-sans text-base font-bold mb-2">
          Hi, I&apos;m {agent.name}
        </p>
        <p className="font-sans text-sm text-muted-foreground max-w-md text-center mb-4">
          {agent.description}
        </p>

        <div className="w-full max-w-md flex justify-between items-center mt-6">
          <div className="flex items-center justify-center flex-col">
            <h1 className="font-sans text-2xl font-semibold">
              {agent.tasks?.length || 0}
            </h1>
            <p className="text-xs font-sans text-muted-foreground">
              Predefined Tasks
            </p>
          </div>
          <div className="flex items-center justify-center flex-col">
            <h1 className="font-sans text-2xl font-semibold">
              {agent?.totalEarned?.toFixed(2) || 0.0}
            </h1>
            <p className="text-xs font-sans text-muted-foreground">
              USDC Balance
            </p>
          </div>
          <div className="flex items-center justify-center flex-col">
            <h1 className="font-sans text-2xl font-semibold">
              {agent.actions?.length || 0}
            </h1>
            <p className="text-xs font-sans text-muted-foreground">
              Actions Performed
            </p>
          </div>
        </div>
        <div className="mb-6 mt-2 flex items-center justify-center w-full max-w-md">
          <AgentAlertModal agent={agent} />
        </div>
        <div className="mt-4 w-full border border-dashed p-1">
          <Input
            placeholder={`What would you like to ask ${agent.name}?`}
            className="bg-background h-12"
            value={message}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
        </div>

        <Button
          variant={
            message.trim().length === 0 || isSending ? "outline" : "default"
          }
          disabled={message.trim().length === 0 || isSending}
          onClick={onSend}
          className="disabled:border-dashed border font-sans mb-4 mt-2 w-full"
        >
          {isSending ? "Sending..." : "Start Chat"}
        </Button>

        <Button
          variant="outline"
          className="mt-4 w-full border-dashed border font-sans"
          onClick={onBack}
        >
          Back to Agents
        </Button>
      </div>
    </div>
  );
}
