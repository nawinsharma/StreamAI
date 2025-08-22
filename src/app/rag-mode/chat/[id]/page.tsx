"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { VirtualMessageList } from "@/components/chat/virtual-message-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { ArrowLeft, FileText, Globe, Youtube, MessageCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createRagChat, addRagMessage, getRagCollections, getRagChatByCollection } from "@/app/actions/ragActions";
import { useRagStore } from "@/stores/rag-store";

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

const MessageSkeleton = () => (
  <div className="flex justify-start mb-6 animate-pulse">
    <div className="flex flex-col items-start space-y-2 max-w-2xl">
      <div className="px-6 py-4 rounded-3xl rounded-bl-lg bg-gray-200 dark:bg-gray-700">
        <Skeleton className="h-4 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  </div>
);

const RagChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  
  const { collections, setCollections } = useRagStore();
  const [chatData, setChatData] = useState<RagChatData | null>(null);
  const [messages, setMessages] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const messageElements = dbMessages.map((msg, index) => (
      <ChatMessage
        key={`${msg.id}-${index}`}
        isUser={msg.role === 'user'}
        content={msg.role === 'assistant' && msg.sources ? (
          <div className="space-y-4">
            <div>{msg.content}</div>
            {msg.sources && msg.sources.length > 0 && (
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
            )}
          </div>
        ) : msg.content}
        timestamp={new Date(msg.createdAt).toLocaleTimeString()}
      />
    ));

    setMessages(messageElements);
    
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
          toast.error("Collection not found");
          router.push("/rag-mode");
          return;
        }

        // First try to get existing chat for this collection
        const existingChatResult = await getRagChatByCollection(collectionId);
        
        if (existingChatResult.success && existingChatResult.data) {
          // Use existing chat
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
          const result = await createRagChat(
            collectionId, 
            `Chat with ${collection.name}`
          );
          
          if (result.success && result.data) {
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
            toast.error("Failed to create chat session");
            router.push("/rag-mode");
          }
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
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
        <ChatMessage
          key={`user-${Date.now()}`}
          isUser={true}
          content={userMessage}
          timestamp={new Date().toLocaleTimeString()}
        />
      );

      setMessages(prev => [...prev, newUserMessage]);

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
      ) : data.response;

      const newAssistantMessage = (
        <ChatMessage
          key={`assistant-${Date.now()}`}
          isUser={false}
          content={assistantContent}
          timestamp={new Date().toLocaleTimeString()}
        />
      );

      setMessages(prev => [...prev, newAssistantMessage]);

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
        <ChatMessage
          key={`error-${Date.now()}`}
          isUser={false}
          content="I'm sorry, I encountered an error processing your message. Please try again."
          timestamp={new Date().toLocaleTimeString()}
        />
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'website':
        return <Globe className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
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
              Back to RAG Mode
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
        {/* Page Header with Back Button */}
        <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <Link href="/rag-mode">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to RAG Mode
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              {getTypeIcon(chatData.collection.type)}
              <div>
                <h1 className="font-semibold text-lg text-gray-900 dark:text-white">
                  Chat with {chatData.collection.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4"
        >
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-12">
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
            ) : (
              <VirtualMessageList
                elements={messages}
                isLoading={isLoading}
                containerRef={containerRef}
              />
            )}
            
            {isLoading && (
              <MessageSkeleton />
            )}
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          onFileSelect={async () => {}} // No file upload in RAG mode
          isLoading={isLoading}
          hasInteracted={messages.length > 0}
          limitReached={false}
          uploading={false}
          user={null}
        />
      </div>
    </div>
  );
};

export default RagChatPage;