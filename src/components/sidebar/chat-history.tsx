"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { getChatsForUser, deleteChat } from "@/app/actions/chatActions";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

interface ChatHistoryProps {
  searchQuery?: string | null;
}

interface Chat {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistory = ({ searchQuery }: ChatHistoryProps) => {
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const path = usePathname();
  const router = useRouter();
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get session on component mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setSessionLoading(false);
      }
    };

    getSession();
  }, []);

  // Fetch chats when component mounts or searchQuery changes
  useEffect(() => {
    const fetchChats = async () => {
      if (!session?.data?.user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getChatsForUser(searchQuery);
        if (result.success && result.data) {
          setChats(result.data);
        } else {
          console.error("Failed to fetch chats:", result.error);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [searchQuery, session?.data?.user, path]);

  const formatChatTitle = (chat: { title: string; branchName?: string | null }) => {
      const cleanTitle = chat.title.replace(/^Branch from: /, '');
      return cleanTitle;
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const confirmDelete = async () => {
    if (chatToDelete) {
      setIsDeleting(true);
      try {
        const result = await deleteChat(chatToDelete);
        if (result.success) {
          // Remove the deleted chat from the local state
          setChats(prevChats => prevChats.filter(chat => chat.id !== chatToDelete));
          
          // Navigate back if we're on the deleted chat page
          if(path === `/chat/${chatToDelete}`) {
            router.back();
          }
        } else {
          console.error("Failed to delete chat:", result.error);
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      } finally {
        setIsDeleting(false);
        setChatToDelete(null);
      }
    }
  };

  if (sessionLoading || !session?.data?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <SidebarGroup className="flex flex-col h-full px-4 py-2">
        <Skeleton className="h-4 w-24 mb-2" />
        <SidebarGroupContent className="flex-1 overflow-y-auto">
          <div className="space-y-3 pr-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!chats?.length) {
    return null;
  }

  return (
    <>
      <SidebarGroup className="flex flex-col h-full px-4 py-2">
      <p className={cn(
        "text-md font-semibold mb-2 group-data-[collapsible=icon]:opacity-0 transition-all duration-500 ease-in-out",
        "text-purple-600"
      )}>
        History
      </p>
      <SidebarGroupContent className="flex-1 overflow-y-auto">
        <SidebarMenu className="space-y-1 pb-52">
            {chats.map((chat : Chat) => (
              <SidebarMenuItem 
                key={chat.id}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
                className="group relative"
              >
                <Link 
                  href={`/chat/${chat.id}`}
                  prefetch={true}
                  className="block w-full"
                >
                  <SidebarMenuButton
                    className={cn(
                      "w-full h-10 rounded-md text-sm group-data-[collapsible=icon]:opacity-0",
                      "transition-all duration-500 ease-in-out group-data-[collapsible=icon]:w-0",
                      "group-data-[collapsible=icon]:p-0 transition-all duration-100 cursor-pointer",
                      chat.id === path.split("/")[2] && "bg-zinc-100 dark:bg-zinc-800"
                    )}
                    isActive={chat.id === path.split("/")[2]}
                    variant="outline"
                  >
                    <div className="w-full flex items-center gap-2 pr-2">
                      <span
                        className={cn(
                          "group-data-[collapsible=icon]:opacity-0 transition-all duration-500 ease-in-out font-medium whitespace-nowrap text-ellipsis overflow-hidden block",
                          "text-zinc-700 dark:text-zinc-100"
                        )}
                        title={formatChatTitle(chat)}
                      >
                        {formatChatTitle(chat)}
                      </span>
                    </div>
                  </SidebarMenuButton>
                  <div 
                    className={cn(
                      "absolute inset-0 flex items-center justify-end pr-2 pointer-events-none transition-opacity duration-200 rounded-md",
                      "bg-zinc-900/5 dark:bg-zinc-100/5",
                      hoveredChat === chat.id ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <Button
                      disabled={isDeleting}
                      onClick={(e: any) => handleDeleteClick(e, chat.id)}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 w-7 p-0 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 pointer-events-auto",
                        "text-zinc-500 hover:text-red-500 hover:bg-red-50",
                        "dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/50",
                        "bg-transparent hover:bg-opacity-10"
                      )}
                      aria-label="Delete chat"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatHistory;