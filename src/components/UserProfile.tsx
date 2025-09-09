import { User, Settings, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  collapsed?: boolean;
}

export const UserProfile = ({ collapsed }: UserProfileProps) => {
  const userName = "John Doe"; // Replace with actual user data
  const userEmail = "john@example.com"; // Replace with actual user data

  return (
    <div className="border-t border-sidebar-border bg-sidebar/50 p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              collapsed ? "px-2" : "px-3"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="ml-3 flex-1 text-left">
                <div className="text-sm font-medium truncate">{userName}</div>
                <div className="text-xs text-sidebar-foreground/70 truncate">{userEmail}</div>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-56">
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium">{userName}</div>
            <div className="text-xs text-muted-foreground">{userEmail}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};