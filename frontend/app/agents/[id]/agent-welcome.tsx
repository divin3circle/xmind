"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { ChatMessage, useAgentChat } from "@/hooks/useAgentChat";
import { LoadingScreen } from "./LoadingScreen";
import { ConnectWalletPrompt } from "./ConnectWalletPrompt";
import { AgentNotFound } from "./AgentNotFound";
import { WelcomeScreen } from "./WelcomeScreen";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { MessageInput } from "./MessageInput";

interface AgentWelcomeProps {
  agentId: string;
}

export function AgentWelcome({ agentId }: AgentWelcomeProps) {
  const router = useRouter();
  const activeAccount = useActiveAccount();

  const {
    agent,
    loading: agentLoading,
    error: agentError,
  } = useAgentDetails(agentId);
  const {
    messages,
    hasChat,
    loading: chatLoading,
    error: chatError,
    setMessages,
    setHasChat,
  } = useAgentChat(agentId, activeAccount?.address);

  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatError) {
      toast.error(chatError);
    }
  }, [chatError]);

  React.useEffect(() => {
    if (agentError) {
      toast.error(agentError);
    }
  }, [agentError]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendMessage = async () => {
    const messageToSend = message.trim();
    if (!messageToSend) return;
    if (!activeAccount) {
      toast.error("Connect your wallet to chat with this agent.");
      return;
    }

    const userMessage: ChatMessage = {
      content: messageToSend,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSending(true);
    setHasChat(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          agentId,
          userAddress: activeAccount.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const agentMessage: ChatMessage = {
        content: data.response,
        sender: "agent",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (agentLoading) {
    return <LoadingScreen />;
  }

  if (!activeAccount) {
    return <ConnectWalletPrompt />;
  }

  if (chatLoading) {
    return <LoadingScreen />;
  }

  if (!agent) {
    return <AgentNotFound agentId={agentId} />;
  }

  if (hasChat) {
    return (
      <div className="h-[90vh] w-full max-w-2xl mx-auto flex flex-col">
        <ChatHeader
          name={agent.name}
          image={agent.image}
          contractAddress={agent.contractAddress || ""}
          onExit={() => router.push("/dashboard")}
        />

        <ChatMessages
          messages={messages}
          isSending={isSending}
          bottomRef={messagesEndRef}
        />

        <MessageInput
          placeholder={`Message ${agent.name}...`}
          value={message}
          onChange={setMessage}
          onSend={handleSendMessage}
          disabled={isSending}
        />
      </div>
    );
  }

  return (
    <WelcomeScreen
      agent={agent}
      message={message}
      onChange={setMessage}
      onSend={handleSendMessage}
      isSending={isSending}
      onBack={() => router.push("/agents")}
    />
  );
}
