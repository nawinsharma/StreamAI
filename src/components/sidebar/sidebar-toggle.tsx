"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Search, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getChatsForUser } from "@/app/actions/chatActions";

interface Chat {
  id: string;
  title: string;
  messages: {
    content: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const SidebarToggle = () => {
  const { state } = useSidebar();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const result = await getChatsForUser();
        if (result.success && result.data) {
          setChats(result.data);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    // When collapsed, position absolutely at the top of the sidebar area
    return (
      <div className="absolute top-2 left-1 right-1 z-50 flex flex-col items-center gap-1 p-1 bg-background/90 backdrop-blur-sm rounded-lg border border-border/50">
        <SidebarTrigger className="size-8 p-1 text-foreground hover:bg-accent hover:text-accent-foreground" />
        
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            <button className="flex size-8 items-center justify-center rounded-lg transition-colors p-1 text-foreground hover:bg-accent hover:text-accent-foreground">
              <Search className="size-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="border-none p-0">
            <DialogTitle className="hidden">Search chats</DialogTitle>
            <Command>
              <CommandInput placeholder="Type to search chats..." />
              <CommandList>
                <CommandEmpty>No chats found.</CommandEmpty>
                <CommandGroup heading="Recent Chats">
                  {chats?.slice(0, 10).map((chat: Chat) => (
                    <CommandItem key={chat.id} asChild>
                      <Link 
                        href={`/chat/${chat.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="w-full cursor-pointer"
                      >
                        <span className="truncate">
                          {chat.title || chat.messages[0]?.content?.substring(0, 50) || "New Chat"}
                        </span>
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>

        <Link
          href="/chat"
          className="flex size-8 items-center justify-center rounded-lg transition-colors p-1 text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Plus className="size-4" />
        </Link>
      </div>
    );
  }

  // When expanded, show just the trigger normally
  return (
    <div className="flex items-center gap-1 rounded-lg p-1">
      <SidebarTrigger className="flex" />
    </div>
  );
};