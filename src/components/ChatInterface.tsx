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
    createNewChat,
    updateCurrentChat,
    switchToChat,
    deleteChat,
  } = useChatHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const messages = currentChat?.messages || [];

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

    // Simulate API call to your LLM
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + "-ai",
        content: `I'm a demo response that shows rich content support!

Here's a sample data table:

| Metric | Value | Change |
|--------|-------|---------|
| Revenue | $45,230 | +12.5% |
| Users | 1,234 | +8.3% |
| Conversion | 3.2% | +0.5% |

I can also show code examples:

\`\`\`javascript
function connectLLM(apiKey) {
  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${apiKey}\` },
    body: JSON.stringify({ message: 'Hello!' })
  });
}
\`\`\`

Connect me to your LLM to get real responses with tables and formatted content!`,
        role: "assistant",
        timestamp: new Date(),
        isNew: true,
      };
      const finalMessages = [...newMessages, aiMessage];
      updateCurrentChat(finalMessages);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
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
                      <div className="flex max-w-sm space-x-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chat-ai border border-border/50 shadow-sm">
                          <Sparkles className="h-4 w-4 text-chat-ai-foreground" />
                        </div>
                        <div className="rounded-2xl bg-chat-ai px-6 py-4 message-shadow border border-border/50">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing"></div>
                            </div>
                            <span className="text-xs text-muted-foreground">AI is thinking...</span>
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