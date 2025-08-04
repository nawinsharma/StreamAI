"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full px-6 py-4 h-20">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-200">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent transition-all duration-200">Auralux Multimodal AI</h1>
              {/* <p className="text-sm text-muted-foreground">A powerful AI assistant that combines text and image processing capabilities</p> */}
            </div>
          </button>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Online</span>
          </div>
          <div className="w-px h-6 bg-border/50"></div>
          <ThemeToggle />
          <Button
            onClick={onNewChat}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 border-2 hover:border-primary/60 dark:border-border/70 dark:hover:border-primary/40 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
            title="Start a new chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </Button>
        </div>
      </div>
    </header>
  );
} 