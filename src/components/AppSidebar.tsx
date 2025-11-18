import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { ChatHistory } from "./ChatHistory";
import { UserProfile } from "./UserProfile";
import { ChatSession } from "@/hooks/useChatHistory";

interface AppSidebarProps {
  chatSessions: ChatSession[];
  currentChatId: string;
  onRefreshContext: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function AppSidebar({
  chatSessions,
  currentChatId,
  onRefreshContext,
  onSwitchChat,
  onDeleteChat,
}: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="none"
      className="border-r border-sidebar-border bg-sidebar w-64"
    >
      <SidebarContent>
        <div className="flex flex-col h-full">
          {/* Chat History */}
          <div className="flex-1">
            <ChatHistory
              chatSessions={chatSessions}
              currentChatId={currentChatId}
              onRefreshContext={onRefreshContext}
              onSwitchChat={onSwitchChat}
              onDeleteChat={onDeleteChat}
            />
          </div>

          {/* User Profile */}
          <UserProfile />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}