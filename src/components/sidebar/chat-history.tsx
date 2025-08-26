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
import { X, Pin, PinOff, ChevronDown } from "lucide-react";
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
import { deleteChat, getChatsForUser, togglePinChat } from "@/app/actions/chatActions";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

interface ChatHistoryProps {
  searchQuery?: string | null;
}

interface Chat {
  id: string;
  title: string;
  messages: Array<{ id: string; role: string; content: string; createdAt: string | Date }>;
  pinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistory = ({ searchQuery }: ChatHistoryProps) => {
  const path = usePathname();
  const router = useRouter();
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPinned, setShowPinned] = useState(true);

  const session = useUser();
  const formatChatTitle = (chat: { title: string; branchName?: string | null }) => {
    const cleanTitle = chat.title.replace(/^Branch from: /, '');
    return cleanTitle;
  };

  // Load chats for the currently signed-in user
  useEffect(() => {
    const loadChats = async () => {
      // If no user, stop loading and clear chats
      if (!session) {
        setChats([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getChatsForUser({ searchQuery: searchQuery ? String(searchQuery) : null });
        if (result.success && result.data) {
          // Transform the Prisma data to match our Chat interface
          const transformedChats: Chat[] = result.data.map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            messages: chat.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt,
            })),
            pinned: chat.pinned || false,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          }));
          setChats(transformedChats);
        } else {
          setChats([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [session, searchQuery]);


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
          setChats(prevChats => prevChats.filter(chat => chat.id !== chatToDelete));
          if (path === `/chat/${chatToDelete}`) {
            router.back();
          }
          toast.success("Chat deleted successfully");
        } else {
          toast.error(result.error || "Failed to delete chat");
        }
      } catch {
        toast.error("Error deleting chat");
      } finally {
        setIsDeleting(false);
        setChatToDelete(null);
      }
    }
  };

  const onTogglePin = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await togglePinChat(chatId);
      if (res.success && res.data) {
        setChats(prev => {
          const now = new Date();
          const next = prev.map(c => {
            if (c.id === chatId) {
              return { 
                ...c, 
                pinned: res.data?.pinned || false,
                updatedAt: now
              };
            }
            return c;
          });
          // Sort: pinned first (most recently pinned at top), then unpinned by updatedAt desc
          return next.sort((a, b) => {
            if (a.pinned && b.pinned) {
              // Both pinned: sort by when they were pinned (most recent first)
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            } else if (a.pinned && !b.pinned) {
              return -1; // a goes first
            } else if (!a.pinned && b.pinned) {
              return 1; // b goes first
            } else {
              // Both unpinned: sort by updatedAt desc
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
          });
        });
      } else {
        toast.error(res.error || "Failed to toggle pin");
      }
    } catch {
      toast.error("Error toggling pin");
    }
  };


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

  // If user is not signed in
  if (!session) {
    return (
      <SidebarGroup className="flex flex-col h-full px-4 py-2">
        <p className={cn(
          "text-md font-semibold mb-2 group-data-[collapsible=icon]:opacity-0 transition-all duration-500 ease-in-out",
          "text-purple-600"
        )}>
          History
        </p>
        <SidebarGroupContent className="flex-1 overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Sign in to view history
            </p>
            <Button
              onClick={() => router.push('/sign-in')}
              className="h-8 px-3 text-sm"
            >
              Sign in
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (chats.length === 0) {
    return (
      <SidebarGroup className="flex flex-col h-full px-4 py-2">
        <p className={cn(
          "text-md font-semibold mb-2 group-data-[collapsible=icon]:opacity-0 transition-all duration-500 ease-in-out",
          "text-purple-600"
        )}>
          History
        </p>
        <SidebarGroupContent className="flex-1 overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              No chats found
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!chats?.length) {
    return null;
  }

  const pinnedChats = chats.filter((c) => !!c.pinned);
  const unpinnedChats = chats.filter((c) => !c.pinned);

  return (
    <>
      <SidebarGroup className="flex flex-col h-full px-4 py-2">
        <SidebarGroupContent className="flex-1 overflow-y-auto">
          <SidebarMenu className="space-y-1 pb-52">
            {!!pinnedChats.length && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-2 py-1 select-none">
                  <div className="flex items-center gap-2">
                    <Pin className="h-3 w-3 text-purple-600" />
                    <span>Pinned</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPinned((v) => !v)}
                    className="cursor-pointer opacity-70 hover:opacity-100 transition"
                    aria-label="Toggle pinned section"
                  >
                    <ChevronDown className={cn("h-3 w-3 transition-transform", showPinned ? "rotate-0" : "-rotate-90")} />
                  </Button>
                </div>
                {showPinned && (
                  <div className="space-y-2 mt-2">
                    {pinnedChats.map((chat: Chat) => (
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
                              "w-full h-8 rounded-md text-sm group-data-[collapsible=icon]:opacity-0",
                              "transition-all duration-300 group-data-[collapsible=icon]:w-0",
                              "group-data-[collapsible=icon]:p-0 cursor-pointer",
                              "bg-transparent hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70",
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
                              onClick={(e) => onTogglePin(e, chat.id)}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 w-7 p-0 mr-1 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 pointer-events-auto",
                                "text-zinc-500 hover:text-yellow-600 hover:bg-yellow-50",
                                "dark:text-zinc-400 dark:hover:text-yellow-400 dark:hover:bg-yellow-950/50",
                                "bg-transparent hover:bg-opacity-10"
                              )}
                              aria-label={chat.pinned ? "Unpin chat" : "Pin chat"}
                            >
                              {chat.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </Button>
                            <Button
                              disabled={isDeleting}
                              onClick={(e) => handleDeleteClick(e, chat.id)}
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
                  </div>
                )}
              </div>
            )}

            {!!unpinnedChats.length && (
              <div className="mt-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-1 select-none">{"Today"}</div>
                <div className="space-y-2">
                {unpinnedChats.map((chat: Chat) => (
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
                          "w-full h-8 rounded-md text-sm group-data-[collapsible=icon]:opacity-0",
                          "transition-all duration-300 group-data-[collapsible=icon]:w-0",
                          "group-data-[collapsible=icon]:p-0 cursor-pointer",
                          "bg-transparent hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70",
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
                          onClick={(e) => onTogglePin(e, chat.id)}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-7 w-7 p-0 mr-1 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 pointer-events-auto",
                            "text-zinc-500 hover:text-yellow-600 hover:bg-yellow-50",
                            "dark:text-zinc-400 dark:hover:text-yellow-400 dark:hover:bg-yellow-950/50",
                            "bg-transparent hover:bg-opacity-10"
                          )}
                          aria-label={chat.pinned ? "Unpin chat" : "Pin chat"}
                        >
                          {chat.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </Button>
                        <Button
                          disabled={isDeleting}
                          onClick={(e) => handleDeleteClick(e, chat.id)}
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
                 </div>
               </div>
             )}
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