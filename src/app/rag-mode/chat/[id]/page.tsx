"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/Header";
import { ArrowLeft, MessageCircle, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { Actions, Action } from "@/components/ui/actions";
import { Markdown } from "@/components/ui/markdown";
import Link from "next/link";
import { toast } from "sonner";
import { createRagChat, addRagMessage, getRagCollections, getRagChatByCollection } from "@/app/actions/ragActions";
import { useRagStore } from "@/stores/rag-store";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";

interface RagSource {
  content: string;
  metadata?: {
    source?: string;
    [key: string]: unknown;
  };
}

interface RagMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  sources?: RagSource[];
  createdAt: Date;
}

interface RagChatData {
  id: string;
  title: string;
  collection: {
    id: string;
    name: string;
    collectionName: string;
    type: string;
    summary?: string | null;
    sourceUrl?: string | null;
  };
  messages: RagMessage[];
}



const RagChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  
  const { collections, setCollections } = useRagStore();
  const [chatData, setChatData] = useState<RagChatData | null>(null);
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [messagesContainerRef, messagesEndRef, scrollToBottom] = useScrollToBottom<HTMLDivElement>();

  // Load collections if not available
  useEffect(() => {
    const loadCollections = async () => {
      if (collections.length === 0) {
        try {
          const result = await getRagCollections();
          if (result.success && result.data) {
            setCollections(result.data.map(col => ({
              id: col.id,
              name: col.name,
              collectionName: col.collectionName,
              summary: col.summary || undefined,
              type: col.type as 'pdf' | 'website' | 'text' | 'youtube',
              sourceUrl: col.sourceUrl || undefined,
              fileName: col.fileName || undefined,
              fileSize: col.fileSize || undefined,
              userId: col.userId,
              createdAt: col.createdAt,
              updatedAt: col.updatedAt,
            })));
          }
        } catch (error) {
          console.error('Failed to load collections:', error);
        }
      }
    };

    loadCollections();
  }, [collections.length, setCollections]);

  // Find collection from store
  const collection = collections.find(c => c.id === collectionId);

  const loadMessages = useCallback((dbMessages: RagMessage[]) => {
    const messageElements = dbMessages.map((msg, index) => {
      if (msg.role === 'user') {
        return (
          <div key={`${msg.id}-${index}`} className="flex justify-end mb-1 animate-in slide-in-from-right-2 duration-300">
            <div className="flex flex-col items-end space-y-2 max-w-[70%]">
              <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-purple-600 text-white shadow-lg border border-violet-600/20 backdrop-blur-sm">
                <div className="text-sm leading-relaxed font-medium">
                  {msg.content}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div key={`${msg.id}-${index}`} className="flex justify-start mb-1 animate-in slide-in-from-left-2 duration-300 group">
            <div className="flex flex-col items-start space-y-2 max-w-[85%]">
              <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
                {msg.sources && msg.sources.length > 0 ? (
                  <div className="space-y-4">
                    <div>{msg.content}</div>
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Sources:</p>
                      <div className="space-y-2">
                        {msg.sources.map((source: RagSource, idx: number) => (
                          <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border-l-2 border-purple-500">
                            <p className="text-gray-700 dark:text-gray-300">{source.content}</p>
                            {source.metadata?.source && (
                              <p className="text-gray-500 mt-1">Source: {source.metadata.source}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Markdown>{msg.content}</Markdown>
                )}
              </div>
              
              {/* Actions - Show on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Actions className="mt-2">
                  <Action
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
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
                  <Action
                    onClick={() => toast.success("Regenerating response...")}
                    label="Redo"
                  >
                    <RotateCcw className="size-3" />
                  </Action>
                </Actions>
              </div>
            </div>
          </div>
        );
      }
    });

    setElements(messageElements);
    
    // Update chat history for context
    setChatHistory(dbMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })));
  }, []);

  // Initialize or load existing chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsInitializing(true);
        
        // Wait for collection to be available
        if (!collection) {
          // If collection is not found, redirect to RAG mode
          console.error('❌ Collection not found:', collectionId);
          toast.error("Collection not found");
          router.push("/rag-mode");
          return;
        }

        console.log('🔍 Initializing chat for collection:', collectionId);

        // First try to get existing chat for this collection
        const existingChatResult = await getRagChatByCollection(collectionId);
        
        if (existingChatResult.success && existingChatResult.data) {
          // Use existing chat
          console.log('✅ Found existing chat:', existingChatResult.data.id);
          
          const transformedData: RagChatData = {
            id: existingChatResult.data.id,
            title: existingChatResult.data.title,
            collection: {
              id: existingChatResult.data.collection.id,
              name: existingChatResult.data.collection.name,
              collectionName: existingChatResult.data.collection.collectionName,
              type: existingChatResult.data.collection.type,
              summary: existingChatResult.data.collection.summary,
              sourceUrl: existingChatResult.data.collection.sourceUrl,
            },
            messages: existingChatResult.data.messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              role: msg.role as 'user' | 'assistant',
              sources: (msg.sources as unknown) as RagSource[] | undefined,
              createdAt: msg.createdAt,
            })),
          };
          
          setChatData(transformedData);
          loadMessages(transformedData.messages);
        } else {
          // Create new chat if none exists
          console.log('🔍 Creating new chat for collection:', collectionId);
          
          const result = await createRagChat(
            collectionId, 
            `Chat with ${collection.name}`
          );
          
          if (result.success && result.data) {
            console.log('✅ Created new chat:', result.data.id);
            
            // Transform the data to match our interface
            const transformedData: RagChatData = {
              id: result.data.id,
              title: result.data.title,
              collection: {
                id: result.data.collection.id,
                name: result.data.collection.name,
                collectionName: result.data.collection.collectionName,
                type: result.data.collection.type,
                summary: result.data.collection.summary,
                sourceUrl: result.data.collection.sourceUrl,
              },
              messages: result.data.messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                role: msg.role as 'user' | 'assistant',
                sources: (msg.sources as unknown) as RagSource[] | undefined,
                createdAt: msg.createdAt,
              })),
            };
            
            setChatData(transformedData);
            loadMessages(transformedData.messages);
          } else {
            console.error('❌ Failed to create chat:', result.error);
            toast.error("Failed to create chat session");
            router.push("/rag-mode");
          }
        }
      } catch (error) {
        console.error("❌ Failed to initialize chat:", error);
        toast.error("Failed to initialize chat");
        router.push("/rag-mode");
      } finally {
        setIsInitializing(false);
      }
    };

    // Only initialize if we have collections loaded and found the collection
    if (collections.length > 0) {
      initializeChat();
    }
  }, [collectionId, collection, router, collections.length, loadMessages]);

  const handleSubmit = async (message: string) => {
    if (!message.trim() || !chatData || isLoading) return;

    setIsLoading(true);
    const userMessage = message.trim();
    setInput("");

    try {
      // Add user message to database
      const userMsgResult = await addRagMessage(chatData.id, userMessage, 'user');
      if (!userMsgResult.success) {
        throw new Error("Failed to save user message");
      }

      // Add user message to UI immediately
      const newUserMessage = (
        <div key={`user-${Date.now()}`} className="flex justify-end mb-1 animate-in slide-in-from-right-2 duration-300">
          <div className="flex flex-col items-end space-y-2 max-w-[70%]">
            <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-purple-600 text-white shadow-lg border border-violet-600/20 backdrop-blur-sm">
              <div className="text-sm leading-relaxed font-medium">{userMessage}</div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      );

      setElements(prev => [...prev, newUserMessage]);
      
      // Trigger scroll to bottom immediately after adding user message
      setTimeout(scrollToBottom, 10);

      // Get RAG response
      const ragResponse = await fetch(`/api/rag/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuery: userMessage,
          collectionName: chatData.collection.collectionName,
          chatHistory: chatHistory,
        }),
      });

      if (!ragResponse.ok) {
        throw new Error("Failed to get RAG response");
      }

      const data = await ragResponse.json();

      // Add assistant message to database
      const assistantMsgResult = await addRagMessage(
        chatData.id, 
        data.response, 
        'assistant', 
        data.sources
      );

      if (!assistantMsgResult.success) {
        throw new Error("Failed to save assistant message");
      }

      // Add assistant message to UI
      const assistantContent = data.sources && data.sources.length > 0 ? (
        <div className="space-y-4">
          <div>{data.response}</div>
          <div className="border-t pt-3 mt-3">
            <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Sources:</p>
            <div className="space-y-2">
              {data.sources.map((source: RagSource, idx: number) => (
                <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border-l-2 border-purple-500">
                  <p className="text-gray-700 dark:text-gray-300">{source.content}</p>
                  {source.metadata?.source && (
                    <p className="text-gray-500 mt-1">Source: {source.metadata.source}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Markdown>{data.response}</Markdown>
      );

      const newAssistantMessage = (
        <div key={`assistant-${Date.now()}`} className="flex justify-start mb-1 animate-in slide-in-from-left-2 duration-300 group">
          <div className="flex flex-col items-start space-y-2 max-w-[85%]">
            <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
              {assistantContent}
            </div>
            
            {/* Actions - Show on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Actions className="mt-2">
                <Action
                  onClick={() => {
                    navigator.clipboard.writeText(data.response);
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
                <Action
                  onClick={() => toast.success("Regenerating response...")}
                  label="Redo"
                >
                  <RotateCcw className="size-3" />
                </Action>
              </Actions>
            </div>
          </div>
        </div>
      );

      setElements(prev => [...prev, newAssistantMessage]);
      setTimeout(scrollToBottom, 10);

      // Update chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.response }
      ]);

    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      
      // Add error message
      const errorMessage = (
        <div key={`error-${Date.now()}`} className="flex justify-start mb-1 animate-in slide-in-from-left-2 duration-300 group">
          <div className="flex flex-col items-start space-y-2 max-w-[85%]">
            <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
              I&apos;m sorry, I encountered an error processing your message. Please try again.
            </div>
          </div>
        </div>
      );
      setElements(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  if (isInitializing) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chat not found</h2>
          <p className="text-gray-500 mb-4">The requested chat session could not be found.</p>
          <Link href="/rag-mode">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Back Button */}
        <div className="border-b border-border bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/rag-mode">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to RAG Mode
              </Badge>
            </Link>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={messagesContainerRef}
            data-messages-container
            className="h-full overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto scrollbar-hide"
          >
            {elements.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Ask questions about &ldquo;{chatData.collection.name}&rdquo; to get started.
                  </p>
                </div>
              </div>
            ) : (
              elements.map((element, index) => (
                <div key={`message-${index}`}>
                  {element}
                </div>
              ))
            )}
            
            {/* Loading Indicator */}
            {isLoading && <MessageSkeleton />}
            
            <div ref={messagesEndRef} data-messages-end />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          onFileSelect={async () => {}} // No file upload in RAG mode
          isLoading={isLoading}
          hasInteracted={elements.length > 0}
          limitReached={false}
          uploading={false}
          user={null}
        />
      </div>
    </div>
  );
};

export default RagChatPage;