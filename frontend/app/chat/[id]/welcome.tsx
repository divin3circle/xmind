"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAgentById, getAgentSamples } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";

function WelcomeChat({ id }: { id: string }) {
  const agent = getAgentById(id);
  const samples = getAgentSamples(id);
  const [message, setMessage] = React.useState("");
  const router = useRouter();

  if (!agent) {
    return (
      <div className="h-[90vh] flex items-center justify-center flex-col">
        <div className="border border-muted-foreground p-2 text-sm ">
          <p className="font-sans text-2xl font-bold mb-2">Agent not found</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-[90vh] flex items-center justify-center flex-col max-w-4xl">
      <div className=" p-2 text-sm w-full flex items-center flex-col ">
        <p className="font-sans text-base font-bold mb-2">
          Hi I&apos;m {agent.agentName}
        </p>
        <p className="font-sans text-sm text-muted-foreground max-w-md text-center">
          {agent.description}
        </p>
        <div className="mt-4 w-full border border-dashed p-1">
          <Input
            placeholder={`What would you like to ask ${agent.agentName}?`}
            className="bg-background h-12"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          variant={message.trim().length === 0 ? "outline" : "default"}
          disabled={message.trim().length === 0}
          className="disabled:border-dashed border font-sans mb-4 mt-2 w-full disabled:text-muted-foreground "
        >
          Start Chatting
        </Button>
        <div className="mt-6 w-full">
          {samples.map((sample, index) => (
            <div
              key={index}
              onClick={() => setMessage(sample)}
              className="border border-dashed p-4 mb-4 cursor-pointer hover:bg-green-500/10 transition-all duration-300"
            >
              <h2 className="font-sans font-semibold mb-2">
                Example {index + 1}
              </h2>
              <p className="font-sans text-sm text-muted-foreground">
                {sample}
              </p>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="mt-4 w-full border-dashed border font-sans"
          onClick={() => router.push("/chat")}
        >
          Back to Agents
        </Button>
      </div>
    </div>
  );
}

export default WelcomeChat;
