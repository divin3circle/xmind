"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTemplateSamples } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";
import { IconLoader2, IconSend } from "@tabler/icons-react";
import Image from "next/image";
import { useX402 } from "@/hooks/useX402";
import { useActiveWallet } from "thirdweb/react";
import { toast } from "sonner";
import { useTemplates } from "@/hooks/useTemplates";

const formatMessage = (content: string) => {
  const lines = content.split("\n");
  return lines.map((line, idx) => {
    // Handle bullet points
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const bulletContent = line.replace(/^[\s]*[*-]\s/, "");
      return (
        <div key={idx} className="flex gap-2 ml-2 my-1">
          <span className="text-muted-foreground">•</span>
          <span className="flex-1">{parseBold(bulletContent)}</span>
        </div>
      );
    }
    return (
      <div key={idx} className={line.trim() ? "my-1" : "my-0.5"}>
        {parseBold(line)}
      </div>
    );
  });
};

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <em key={i} className="bg-green-500/20 px-1">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

interface Message {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: Date;
}

function WelcomeChat({ id }: { id: string }) {
  const samples = getTemplateSamples(id);
  const [message, setMessage] = React.useState("");
  const [isChatting, setIsChatting] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { payForResource, isPending, error, isError } = useX402();
  const activeWallet = useActiveWallet();
  const { templates, loading: templatesLoading } = useTemplates();
  const template = templates?.find((template) => template._id === id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    const messageToSend = content || message.trim();
    if (!messageToSend) return;
    if (!activeWallet) {
      toast.error("Please connect your wallet to proceed.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsChatting(true);
    setIsTyping(true);

    try {
      const data = await payForResource({
        resourceUrl: `/api/agent`,
        message: messageToSend,
        agentId: id,
        address: activeWallet?.getAccount()?.address || "",
      });
      const premiumContent =
        data?.data?.premiumContent || JSON.stringify(data?.data || data);

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: premiumContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  if (templatesLoading) {
    return (
      <div className="h-[90vh] flex items-center justify-center flex-col">
        <IconLoader2 className="animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-[90vh] flex items-center justify-center flex-col">
        <div className="text-muted-foreground p-2 text-xs ">
          <p className="font-sans text-2xl font-bold mb-2">
            Template not found
          </p>
        </div>
      </div>
    );
  }

  if (isChatting) {
    return (
      <div className="h-[90vh] w-full max-w-2xl flex flex-col">
        <div className="border-b border-dashed p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="border border-dashed p-1">
              <Image
                src={template.image}
                alt={template.templateName}
                width={40}
                height={40}
                className="w-10 h-10 object-cover"
              />
            </div>
            <div>
              <h2 className="font-sans font-semibold text-sm">
                {template.templateName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {template.tagline}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={() => router.push("/agents")}
          >
            Exit
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] border border-dashed p-3 wrap-break-word overflow-wrap-anywhere ${
                  msg.role === "user"
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-muted/50"
                }`}
              >
                <div className="text-xs md:text-sm font-sans wrap-break-word overflow-hidden">
                  {msg.role === "agent"
                    ? formatMessage(msg.content)
                    : msg.content}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[75%] border border-dashed p-3 bg-muted/50">
                <p className="text-sm font-sans text-muted-foreground">
                  {template.templateName} processing payment{" "}
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4">
          <div className="flex gap-2">
            <div className="flex-1 border border-dashed p-1">
              <Input
                placeholder={`Message ${template.templateName}...`}
                className="bg-background h-10 border-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(message.trim());
                  }
                }}
              />
            </div>
            <Button
              onClick={() => handleSendMessage(message.trim())}
              disabled={!message.trim()}
              variant={message.trim().length === 0 ? "outline" : "default"}
              className="disabled:border-dashed border font-sans h-12 w-12 disabled:text-muted-foreground "
            >
              <IconSend size={28} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className="h-[90vh] flex items-center justify-center flex-col max-w-4xl">
        <div className=" p-2 text-sm w-full flex items-center flex-col ">
          <p className="font-sans text-base font-bold mb-2">Payment Error</p>
          <p className="font-sans text-sm text-muted-foreground max-w-md text-center">
            {error?.message || "Payment cancelled or failed. Try again."}
          </p>
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

  return (
    <div className="h-[90vh] flex items-center justify-center flex-col max-w-4xl">
      <div className=" p-2 text-sm w-full flex items-center flex-col ">
        <p className="font-sans text-base font-bold mb-2">
          Hi I&apos;m {template.templateName}
        </p>
        <p className="font-sans text-sm text-muted-foreground max-w-md text-center">
          {template.tagline}
        </p>
        <div className="mt-4 w-full border border-dashed p-1">
          <Input
            placeholder={`What would you like to ask ${template.templateName}?`}
            className="bg-background h-12"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(message.trim());
              }
            }}
          />
        </div>
        <Button
          variant={
            message.trim().length === 0 || isPending || isTyping
              ? "outline"
              : "default"
          }
          disabled={message.trim().length === 0 || isPending || isTyping}
          onClick={() => {
            handleSendMessage(message);
          }}
          className="disabled:border-dashed border font-sans mb-4 mt-2 w-full disabled:text-muted-foreground "
        >
          {isPending
            ? "Processing Payment..."
            : isTyping
              ? "Agent Thinking..."
              : "Use Agent"}
        </Button>
        <div className="mt-6 w-full">
          {samples.map((sample, index) => (
            <div
              key={index}
              onClick={() => handleSendMessage(sample)}
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
          Back to Templates
        </Button>
      </div>
    </div>
  );
}

export default WelcomeChat;
