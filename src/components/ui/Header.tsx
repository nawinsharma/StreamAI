"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
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
import { Plus, Brain } from "lucide-react";

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  const router = useRouter();
  const user = useUser();

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

  const handleMemoriesClick = () => {
    router.push('/memories');
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
          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </Button>
          
          <div className="w-px h-6 bg-border/50"></div>
          
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
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMemoriesClick}>
                  <Brain className="mr-2 h-4 w-4" />
                  Memories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} variant="outline" size="sm">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 