"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 h-20 flex items-center flex-shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-shrink-0">
            <h1 className="text-xl font-semibold text-foreground">Auralux Multimodal AI</h1>
            {/* <p className="text-sm text-muted-foreground">A powerful AI assistant that combines text and image processing capabilities</p> */}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Online</span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <ThemeToggle />
          <Button
            onClick={onNewChat}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 border-2 hover:border-primary/60 dark:border-border/70 dark:hover:border-primary/40"
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