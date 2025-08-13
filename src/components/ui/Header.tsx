"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/chat-store";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  const router = useRouter();
  const { getRemainingChats, isLimitReached } = useChatStore();
  const user = useUser();
  const remainingChats = getRemainingChats();
  const limitReached = isLimitReached();

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Successfully signed out!");
      window.location.reload();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleLogin = () => {
    router.push('/sign-in');
  };

  return (
    <header className="relative z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full px-6 py-4 h-20">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer group"
          >
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent transition-all duration-200">Nawin</h1>
            </div>
          </button>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Trial Counter - Only show for non-authenticated users */}
          {!user && (
            <>
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                limitReached 
                  ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
                  : remainingChats <= 2 
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                    : 'bg-blue-600/10 border-blue-600/20 text-blue-600 dark:text-blue-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-sm font-medium">
                  {limitReached ? 'Limit Reached' : `${remainingChats} chats left`}
                </span>
              </div>
              
              <div className="w-px h-6 bg-border/50"></div>
            </>
          )}
          
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Online</span>
          </div>
          
          <div className="w-px h-6 bg-border/50"></div>
          <ThemeToggle />
          {/* User Profile or Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                    <AvatarFallback>
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogin}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 