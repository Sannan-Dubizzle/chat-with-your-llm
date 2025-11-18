import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Area */}
      <div className="relative">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[52px] max-h-32 resize-none bg-chat-input border-chat-input-border/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 rounded-xl input-shadow transition-all duration-200 font-medium placeholder:text-muted-foreground/60"
              disabled={disabled}
            />
          </div>
          
          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="default"
            className="h-[52px] px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Send className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-0.5" />
            <span className="font-medium">Send</span>
          </Button>
        </div>
      </div>
      
      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/70">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span className="hidden sm:block">
          {message.length > 0 && `${message.length} characters`}
        </span>
      </div>
    </div>
  );
};