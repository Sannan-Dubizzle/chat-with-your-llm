import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatHistory } from "./ChatHistory";
import { UserProfile } from "./UserProfile";
import { ChatSession } from "@/hooks/useChatHistory";

interface AppSidebarProps {
  chatSessions: ChatSession[];
  currentChatId: string;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function AppSidebar({
  chatSessions,
  currentChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={`border-r border-sidebar-border bg-sidebar ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      {/* Trigger inside sidebar for collapsed state */}
      {collapsed && (
        <div className="p-2">
          <SidebarTrigger className="w-full" />
        </div>
      )}

      <SidebarContent>
        <div className="flex flex-col h-full">
          {/* Chat History */}
          <div className="flex-1">
            <ChatHistory
              chatSessions={chatSessions}
              currentChatId={currentChatId}
              onNewChat={onNewChat}
              onSwitchChat={onSwitchChat}
              onDeleteChat={onDeleteChat}
              collapsed={collapsed}
            />
          </div>

          {/* User Profile */}
          <UserProfile collapsed={collapsed} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}