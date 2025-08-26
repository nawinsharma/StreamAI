"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getPublicChat } from "@/app/actions/chatActions";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/ui/markdown";
import { Actions, Action } from "@/components/ui/actions";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
  };
}

export default function SharedChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const resolvedParams = use(params);
  const chatId = resolvedParams.chatId;
  const router = useRouter();
  const user = useUser();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const result = await getPublicChat(chatId);
        
        if (result.success && result.data) {
          const chatData = result.data;
          
          console.log("Public chat data:", {
            chatOwnerName: chatData.user.name,
            currentUserEmail: user?.email,
            userLoaded: user !== undefined
          });
          
          const transformedChat: Chat = {
            id: chatData.id,
            title: chatData.title,
            messages: chatData.messages.map((msg: { id: string; role: string; content: string; createdAt: string | Date }) => ({
              id: msg.id,
              role: (msg.role === 'user' || msg.role === 'assistant') ? msg.role : 'assistant',
              content: msg.content,
              createdAt: new Date(msg.createdAt),
            })),
            createdAt: chatData.createdAt,
            updatedAt: chatData.updatedAt,
            user: chatData.user,
          };
          
          setChat(transformedChat);
        } else {
          console.log("Failed to load public chat:", result.error);
          setError(result.error || "Failed to load chat");
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
        setError("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when user context is defined (loaded or null)
    if (user !== undefined) {
      fetchChat();
    }
  }, [chatId, user, router]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shared chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Chat Not Available</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {error || "This chat is not available for public viewing."}
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />
      
      {/* Chat Info Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{chat.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>Shared by {chat.user.name || "Anonymous"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Read-only view</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto scrollbar-hide">
          {chat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">No messages in this chat.</p>
              </div>
            </div>
          ) : (
            chat.messages.map((message) => (
              <div key={message.id} className="group">
                {message.role === "user" ? (
                  <div className="flex justify-end mb-1">
                    <div className="flex flex-col items-end space-y-2 max-w-[70%]">
                      <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-purple-600 text-white shadow-lg border border-violet-600/20 backdrop-blur-sm">
                        <div className="text-sm leading-relaxed font-medium">{message.content}</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start mb-1">
                    <div className="flex flex-col items-start space-y-2 max-w-[85%]">
                      <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
                        <Markdown>{message.content}</Markdown>
                      </div>
                      
                      {/* Actions - Show on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Actions className="mt-2">
                          <Action
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast.success("Copied to clipboard");
                            }}
                            label="Copy"
                          >
                            <Copy className="size-3" />
                          </Action>
                          <Action
                            onClick={() => toast.success("Message liked")}
                            label="Like"
                          >
                            <ThumbsUp className="size-3" />
                          </Action>
                          <Action
                            onClick={() => toast.success("Message disliked")}
                            label="Dislike"
                          >
                            <ThumbsDown className="size-3" />
                          </Action>
                        </Actions>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Read-only Notice */}
      <div className="border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="text-center text-sm text-muted-foreground">
            <Lock className="w-4 h-4 inline mr-2" />
            This is a read-only view of a shared chat. Sign in to start your own conversations.
          </div>
        </div>
      </div>
    </div>
  );
}
