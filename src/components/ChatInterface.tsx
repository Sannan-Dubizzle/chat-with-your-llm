import { useState, useRef, useEffect } from "react";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import { AppSidebar } from "./AppSidebar";
import { useChatHistory } from "@/hooks/useChatHistory";
import { Sparkles, MessageCircle } from "lucide-react";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isNew?: boolean;
}

export const ChatInterface = () => {
  const {
    chatSessions,
    currentChat,
    currentChatId,
    updateCurrentChat,
    switchToChat,
    deleteChat,
    refreshContext,
  } = useChatHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const latestMessagesRef = useRef<ChatMessage[]>([]);
  const previousCumulativeRef = useRef<string>("");

  const messages = currentChat?.messages || [];

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user is near bottom of chat
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight <= threshold;
  };

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    setShouldAutoScroll(isNearBottom());
  };

  // Only auto-scroll if user is near bottom or it's a new message
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // Also auto-scroll while streaming text updates
  useEffect(() => {
    if (shouldAutoScroll && streamedText) {
      scrollToBottom();
    }
  }, [streamedText, shouldAutoScroll]);

  // Ensure thinking bubble starts empty on a new request
  useEffect(() => {
    if (isLoading) {
      setStreamedText("");
    }
  }, [isLoading]);

  // Mark messages as not new after animation
  useEffect(() => {
    if (messages.some(msg => msg.isNew)) {
      const timer = setTimeout(() => {
        const updatedMessages = messages.map(msg => ({ ...msg, isNew: false }));
        updateCurrentChat(updatedMessages);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages, updateCurrentChat]);

  const handleSendMessage = async (content: string) => {
    // Force auto-scroll when user sends a message
    setShouldAutoScroll(true);
    // Reset bubble immediately for this request (do not reset baseline here)
    setStreamedText("");
    // Reset thinking bubble and cumulative tracker for new request
    setStreamedText("");
    previousCumulativeRef.current = "";
    
    const userMessage: ChatMessage = {
      id: Date.now() + "-user",
      content,
      role: "user",
      timestamp: new Date(),
      isNew: true,
    };

    const newMessages = [...messages, userMessage];
    updateCurrentChat(newMessages);
    setIsLoading(true);

    // Abort any previous in-flight request
    if (activeRequestControllerRef.current) {
      activeRequestControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeRequestControllerRef.current = controller;

    try {
      // Initialize baseline to the last assistant message OR to the first incoming chunk
      const lastAssistant = [...(latestMessagesRef.current || [])].reverse().find(m => m.role === "assistant");
      previousCumulativeRef.current = lastAssistant?.content || previousCumulativeRef.current || "";

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const normalizedBase = baseUrl && !/^https?:\/\//i.test(baseUrl) ? `http://${baseUrl}` : baseUrl;
      const url = new URL("/chat", normalizedBase || window.location.origin);
      url.search = new URLSearchParams({
        thread_id: currentChatId || "",
        question: content,
      }).toString();

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/x-ndjson, text/event-stream;q=0.9, application/json;q=0.8",
        },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();
      let bufferedText = "";
      let latestChunk = "";

      const applyChunk = (chunkText: string) => {
        // Expect NDJSON lines, each with a JSON object having a `message` field
        const lines = chunkText.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          try {
            const parsed = JSON.parse(line);
            const incoming: string = parsed?.message ?? "";
            if (!incoming) continue;
            // Compute only the new part when backend sends cumulative text.
            // Be robust if the backend prepends the previous content verbatim or with minor differences.
            let prev = previousCumulativeRef.current || "";
            if (!prev && latestMessagesRef.current && latestMessagesRef.current.length > 0) {
              const lastAssistant = [...latestMessagesRef.current].reverse().find(m => m.role === "assistant");
              prev = lastAssistant?.content || "";
              previousCumulativeRef.current = prev;
            }
            let toShow = incoming;
            if (prev) {
              if (incoming.startsWith(prev)) {
                toShow = incoming.slice(prev.length);
              } else {
                const idx = incoming.indexOf(prev);
                if (idx >= 0) {
                  toShow = incoming.slice(idx + prev.length);
                }
              }
            }
            previousCumulativeRef.current = incoming;
            latestChunk = toShow || incoming;
            setStreamedText(toShow);
          } catch (_e) {
            // Ignore partial JSON; will be handled when buffer completes a line
          }
        }
      };

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = textDecoder.decode(value, { stream: true });
        bufferedText += chunkText;
        const lastNewline = bufferedText.lastIndexOf("\n");
        if (lastNewline !== -1) {
          const complete = bufferedText.slice(0, lastNewline);
          const remainder = bufferedText.slice(lastNewline + 1);
          applyChunk(complete);
          bufferedText = remainder;
        }
      }

      // Flush any remaining buffered line if it's valid JSON
      if (bufferedText.trim().length > 0) {
        try {
          applyChunk(bufferedText);
        } catch (_e) {
          // ignore trailing partial
        }
      }
      // Finalize: only include the latest chunk in the final message card
      const finalText = latestChunk || "";
      const finalAssistant: ChatMessage = {
        id: Date.now() + "-ai",
        content: finalText,
        role: "assistant",
        timestamp: new Date(),
        isNew: true,
      };
      // Clear typing bubble before rendering the final message
      setStreamedText("");
      setIsLoading(false);
      previousCumulativeRef.current = "";

      const finalMessages: ChatMessage[] = [
        ...((latestMessagesRef.current || newMessages) as ChatMessage[]),
        finalAssistant,
      ];
      latestMessagesRef.current = finalMessages;
      updateCurrentChat(finalMessages);
    } catch (error: unknown) {
      // Clear typing bubble on error as well
      setStreamedText("");
      setIsLoading(false);
      previousCumulativeRef.current = "";

      const fallback: ChatMessage[] = [
        ...((latestMessagesRef.current || newMessages) as ChatMessage[]),
        {
          id: Date.now() + "-ai",
          content: "Sorry, I couldn't reach the server. Please try again.",
          role: "assistant",
          timestamp: new Date(),
          isNew: true,
        },
      ];
      latestMessagesRef.current = fallback;
      updateCurrentChat(fallback);
    } finally {
      // no-op: already cleared isLoading/streamedText above on success/error
      if (activeRequestControllerRef.current === controller) {
        activeRequestControllerRef.current = null;
      }
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onRefreshContext={refreshContext}
        onSwitchChat={switchToChat}
        onDeleteChat={deleteChat}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-gradient-to-br from-background via-background to-background-secondary">
        {/* Enhanced Header */}
        <header className="glass-effect border-b border-border/50 shadow-sm">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  {currentChat?.title || "AI Chat Assistant"}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>Powered by your LLM</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Messages Container */}
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto h-full max-w-5xl">
            <div className="flex h-full flex-col">
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-6 py-8"
                onScroll={handleScroll}
              >
                <div className="space-y-8">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={message.isNew ? "animate-message-enter" : ""}
                    >
                      <Message message={message} />
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="flex max-w-xl space-x-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chat-ai border border-border/50 shadow-sm">
                          <Sparkles className="h-4 w-4 text-chat-ai-foreground" />
                        </div>
                        <div className="rounded-2xl bg-chat-ai px-6 py-4 message-shadow border border-border/50">
                          <div className="flex items-start space-x-3">
                            <div className="flex pt-1 space-x-1 min-w-[20px]">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing"></div>
                            </div>
                            <div className="whitespace-pre-wrap break-words text-sm text-foreground">{streamedText}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Input Area */}
        <footer className="glass-effect border-t border-border/50 shadow-lg">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </footer>
      </div>
    </div>
  );
};