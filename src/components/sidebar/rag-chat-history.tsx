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
import { Brain, X, FileText, Globe, Youtube } from "lucide-react";
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
import { getRagChatsForUser, deleteRagChat } from "@/app/actions/ragActions";
import { useTheme } from "next-themes";

interface RagChatHistoryProps {
  searchQuery?: string | null;
}

interface RagChat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  collection: {
    id: string;
    name: string;
    type: string;
  };
  _count: {
    messages: number;
  };
}

const RagChatHistory = ({ searchQuery }: RagChatHistoryProps) => {
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const path = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();

  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [chats, setChats] = useState<RagChat[]>([]);
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
        const result = await getRagChatsForUser(searchQuery);
        if (result.success && result.data) {
          setChats(result.data);
        } else {
          console.error("Failed to fetch RAG chats:", result.error);
        }
      } catch (error) {
        console.error("Error fetching RAG chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [searchQuery, session?.data?.user, path]);

  const formatChatTitle = (chat: RagChat) => {
    const cleanTitle = chat.title.replace(/^Chat with /, '');
    return cleanTitle;
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteRagChat(chatToDelete);
      if (result.success) {
        setChats(prev => prev.filter(chat => chat.id !== chatToDelete));
        
        // If we're currently viewing the deleted chat, redirect to RAG dashboard
        if (path === `/rag-mode/chat/${chatToDelete}`) {
          router.push('/rag-mode');
        }
      } else {
        console.error("Failed to delete RAG chat:", result.error);
      }
    } catch (error) {
      console.error("Error deleting RAG chat:", error);
    } finally {
      setIsDeleting(false);
      setChatToDelete(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'text':
        return <FileText className="h-3 w-3" />;
      case 'website':
        return <Globe className="h-3 w-3" />;
      case 'youtube':
        return <Youtube className="h-3 w-3" />;
      default:
        return <Brain className="h-3 w-3" />;
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <SidebarGroup className="flex flex-col h-full px-4 py-2">
        <p className={cn(
          "text-md font-semibold mb-2 group-data-[collapsible=icon]:opacity-0 transition-all duration-500 ease-in-out",
          "text-purple-600"
        )}>
          RAG Chats
        </p>
        <SidebarGroupContent className="flex-1 overflow-y-auto">
          <SidebarMenu className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <SidebarMenuItem key={i}>
                <div className="flex items-center space-x-2 p-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
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
          RAG Chats
        </p>
        <SidebarGroupContent className="flex-1 overflow-y-auto">
          <SidebarMenu className="space-y-1 pb-52">
            {chats.map((chat: RagChat) => (
              <SidebarMenuItem 
                key={chat.id}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
                className="group relative"
              >
                <Link 
                  href={`/rag-mode/chat/${chat.collection.id}`}
                  prefetch={true}
                  className="block w-full"
                >
                  <SidebarMenuButton
                    isActive={path === `/rag-mode/chat/${chat.collection.id}`}
                    className={cn(
                      "w-full justify-start text-left py-3 px-3 h-auto group-data-[collapsible=icon]:px-2",
                      "transition-all duration-300 ease-in-out",
                      "hover:bg-accent/50",
                      path === `/rag-mode/chat/${chat.collection.id}` && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-2 w-full min-w-0">
                      <div className="flex-shrink-0">
                        {getTypeIcon(chat.collection.type)}
                      </div>
                      <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium truncate leading-tight">
                          {formatChatTitle(chat)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat._count.messages} messages • {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </Link>
                
                {/* Delete button - only show on hover */}
                {hoveredChat === chat.id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => handleDeleteClick(e, chat.id)}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2",
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                          "p-1 rounded-sm hover:bg-destructive/10 hover:text-destructive",
                          "group-data-[collapsible=icon]:hidden"
                        )}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Delete RAG chat
                    </TooltipContent>
                  </Tooltip>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={!!chatToDelete} onOpenChange={() => setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RAG Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this RAG chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RagChatHistory; 