import { User } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/skeleton";

export const UserProfile = () => {
  const { data, isLoading } = useCurrentUser();
  
  const userName = data?.admin?.name || "User";
  const userEmail = data?.admin?.email || "";
  const profileImage = data?.admin?.profile_image;

  return (
    <div className="border-t border-sidebar-border bg-sidebar/50 p-3">
      <div className="flex items-center px-3">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="ml-3 flex-1 text-left space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </>
        ) : (
          <>
            {profileImage ? (
              <img
                src={profileImage}
                alt={userName}
                className="h-8 w-8 rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
            <div className="ml-3 flex-1 text-left">
              <div className="text-sm font-medium truncate text-sidebar-foreground">{userName}</div>
              {userEmail && (
                <div className="text-xs text-sidebar-foreground/70 truncate">{userEmail}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};