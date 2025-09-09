import { MessageCircle, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatSession } from "@/hooks/useChatHistory";
import { formatDistanceToNow } from "date-fns";

interface ChatHistoryProps {
  chatSessions: ChatSession[];
  currentChatId: string;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  collapsed?: boolean;
}

export const ChatHistory = ({
  chatSessions,
  currentChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  collapsed,
}: ChatHistoryProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3 border-b border-sidebar-border">
        <Button
          onClick={onNewChat}
          className={`w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative rounded-lg transition-colors ${
                session.id === currentChatId
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              }`}
            >
              <Button
                variant="ghost"
                onClick={() => onSwitchChat(session.id)}
                className={`w-full justify-start text-left h-auto p-3 ${
                  collapsed ? "px-2" : "pr-8"
                } ${
                  session.id === currentChatId
                    ? "bg-sidebar-accent hover:bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {session.title}
                    </div>
                    <div className="text-xs opacity-70 truncate">
                      {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                    </div>
                  </div>
                )}
              </Button>

              {/* Delete button - only show when not collapsed and on hover */}
              {!collapsed && chatSessions.length > 1 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDeleteChat(session.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};