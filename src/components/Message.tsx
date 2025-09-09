import { ChatMessage } from "./ChatInterface";
import { MessageContent } from "./MessageContent";
import { User, Sparkles } from "lucide-react";

interface MessageProps {
  message: ChatMessage;
}

export const Message = ({ message }: MessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex group transition-all duration-200 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-xs sm:max-w-2xl lg:max-w-4xl space-x-4 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
        {/* Enhanced Avatar */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-200 group-hover:shadow-md ${
          isUser 
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/20" 
            : "bg-chat-ai border border-border/50 text-chat-ai-foreground hover:border-border"
        }`}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>

        {/* Enhanced Message Bubble */}
        <div className="flex flex-col space-y-1">
          <div
            className={`rounded-2xl px-6 py-4 message-shadow transition-all duration-200 group-hover:message-hover-shadow ${
              isUser
                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/10"
                : "bg-chat-ai text-chat-ai-foreground border border-border/50 hover:border-border/70"
            }`}
          >
            <div className="text-sm font-medium">
              <MessageContent content={message.content} isUser={isUser} />
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <span className={`text-xs px-2 transition-opacity duration-200 opacity-0 group-hover:opacity-60 ${
              isUser 
                ? "text-foreground/70" 
                : "text-muted-foreground"
            }`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};