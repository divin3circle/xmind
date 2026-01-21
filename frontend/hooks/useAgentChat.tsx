import React from "react";

export interface ChatMessage {
  content: string;
  sender: "user" | "agent";
  timestamp: string | Date;
}

interface UseAgentChatResult {
  messages: ChatMessage[];
  hasChat: boolean;
  loading: boolean;
  error: string | null;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setHasChat: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: () => Promise<void>;
}

export function useAgentChat(
  agentId: string | undefined,
  userAddress: string | undefined,
): UseAgentChatResult {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [hasChat, setHasChat] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(
    !!(agentId && userAddress),
  );
  const [error, setError] = React.useState<string | null>(null);

  const fetchChat = React.useCallback(async () => {
    if (!agentId || !userAddress) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/chat?agentId=${agentId}&userAddress=${userAddress}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch chat");
      }
      const data = await res.json();
      const fetchedMessages: ChatMessage[] = data.chat?.messages || [];
      setMessages(fetchedMessages);
      setHasChat(fetchedMessages.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch chat");
      setMessages([]);
      setHasChat(false);
    } finally {
      setLoading(false);
    }
  }, [agentId, userAddress]);

  React.useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  return {
    messages,
    hasChat,
    loading,
    error,
    setMessages,
    setHasChat,
    refetch: fetchChat,
  };
}
