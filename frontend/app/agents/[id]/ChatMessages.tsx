import React from "react";
import { ChatMessage } from "@/hooks/useAgentChat";

const formatMessage = (content: string) => {
  const lines = content.split("\n");
  return lines.map((line, idx) => {
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

interface ChatMessagesProps {
  messages: ChatMessage[];
  isSending: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  isSending,
  bottomRef,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] border border-dashed p-3 ${
              msg.sender === "user"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-muted/50"
            }`}
          >
            <div className="text-xs font-sans">
              {formatMessage(msg.content)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {isSending && (
        <div className="flex justify-start">
          <div className="max-w-[75%] border border-dashed p-3 bg-muted/50">
            <div className="text-xs font-sans flex items-center gap-2">
              <span className=" animate-bounce delay-0 text-lg font-semibold">
                .
              </span>
              <span className="animate-bounce delay-100 text-lg font-semibold">
                .
              </span>
              <span className="animate-bounce delay-200 text-lg font-semibold">
                .
              </span>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
