"use client";

import { useState, useRef, useEffect } from "react";
import { useActions } from "ai/rsc";
import { HumanMessageText, AISkeletonLoading } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/ui/Header";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useChatStore } from "@/lib/chat-store";
import axios from "axios";

const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });

// Suggestion questions component
const SuggestionQuestions = ({ onQuestionClick }: { onQuestionClick: (question: string, shouldAutoSubmit?: boolean) => void }) => {
  const suggestions = [
    "A pie chart showing air composition",
    "what's the current weather of Bengaluru",
    "Analyze this image for me",
    "What can you help me with?",
    "Explain a complex concept",
    "Generate ideas for my project",
    "Summarize a long text",
    "Create a plan for my goals"
  ];

  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-3 text-center">Try asking me:</p>
      <div className="relative overflow-hidden">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        {/* Infinite scrolling container */}
        <div className="flex gap-2 animate-scroll hover:pause-scroll">
          {/* First set of suggestions */}
          {suggestions.map((suggestion, index) => (
            <Button
              key={`first-${index}`}
              onClick={() => onQuestionClick(suggestion, false)}
              variant="outline"
              size="sm"
              className="rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-primary/20 active:scale-95 hover:bg-primary/5 hover:border-primary/30 hover:text-primary whitespace-nowrap flex-shrink-0"
            >
              {suggestion}
            </Button>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {suggestions.map((suggestion, index) => (
            <Button
              key={`second-${index}`}
              onClick={() => onQuestionClick(suggestion, false)}
              variant="outline"
              size="sm"
              className="rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-primary/20 active:scale-95 hover:bg-primary/5 hover:border-primary/30 hover:text-primary whitespace-nowrap flex-shrink-0"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Quick action buttons component
const QuickActions = ({ onActionClick }: { onActionClick: (action: string, shouldAutoSubmit: boolean) => void }) => {
  const actions = [
    { icon: "👁️", label: "Analyze images", action: "Analyze this image for me", autoSubmit: false },
    { icon: "📊", label: "A pie chart showing air composition", action: "A pie chart showing air composition", autoSubmit: true },
    { icon: "💡", label: "Make a plan", action: "Help me create a plan", autoSubmit: true },
    { icon: "💻", label: "what's the current weather of Bengaluru", action: "what's the current weather of Bengaluru", autoSubmit: true },
    { icon: "✍️", label: "Help me write", action: "Help me write content", autoSubmit: true },
    { icon: "➕", label: "More", action: "What can you help me with?", autoSubmit: true }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={() => onActionClick(action.action, action.autoSubmit)}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="text-xs text-center">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default function Home() {
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const user = useUser();
  const router = useRouter();
  const { sendMessage } = useActions();
  const { incrementChat, isLimitReached, getRemainingChats } = useChatStore();
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSuggestionClick = (question: string, shouldAutoSubmit: boolean = false) => {
    setInput(question);
    if (shouldAutoSubmit) {
      setTimeout(() => {
        onSubmit(question);
      }, 100);
    } else {
      // Focus the input after setting the value
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleNewChat = async () => {
    if (!user && isLimitReached()) {
      toast.error("Please sign in to continue chatting.");
      return;
    }
    
    if (user) {
      // Create new chat for authenticated users
      try {
        const response = await axios.post("/api/chats", {
          title: "New Chat",
        });

        if (response.status === 200) {
          const chat = response.data;
          router.push(`/chat/${chat.id}`);
          return;
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        toast.error("Failed to create new chat");
      }
    }
    
    // For non-authenticated users or if chat creation fails, just clear the current chat
    setElements([]);
    setInput("");
    setSelectedFile(null);
    setHasInteracted(false);
    setCurrentChatId(null);
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  async function onSubmit(prompt: string) {
    if (!prompt || isLoading) return;

    // Check if limit is reached - only for non-authenticated users
    if (!user && isLimitReached()) {
      toast.error("Please sign in to continue chatting.");
      return;
    }

    setIsLoading(true);
    const newElements = [...elements];
    let base64File: string | undefined = undefined;

    if (selectedFile) {
      try {
        base64File = await convertFileToBase64(selectedFile);
      } catch (error) {
        ErrorHandler.handleGeneralError(error instanceof Error ? error : "Failed to process file", "File processing");
        setIsLoading(false);
        return;
      }
    }

    // For authenticated users, create a new chat if this is the first message
    let chatId: string | undefined = undefined;
    if (user && elements.length === 0) {
      try {
        const response = await axios.post("/api/chats", {
          title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
        });

        if (response.status === 200) {
          const chat = response.data;
          chatId = chat.id;
          // Redirect to the new chat page with the initial message
          router.push(`/chat/${chat.id}?message=${encodeURIComponent(prompt)}`);
          return; // Exit early, the chat page will handle the message
        } else {
          console.error("Failed to create chat");
          toast.error("Failed to create new chat");
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        toast.error("Failed to create new chat");
      }
    }

    // Add user message to the chat
    newElements.push(
      <div className="message-enter animate-in slide-in-from-bottom-4 duration-500">
        {selectedFile && (
          <div className="mb-4 rounded-xl overflow-hidden border border-border/50 shadow-lg">
            <Image
              src={URL.createObjectURL(selectedFile)}
              alt="Uploaded image"
              width={800}
              height={600}
              className="w-full max-w-2xl h-auto object-cover"
            />
          </div>
        )}
        <HumanMessageText content={prompt} />
      </div>
    );

    // Update elements immediately to show user message
    setElements(newElements);
    setHasInteracted(true);

    try {
      const element = await sendMessage({
        prompt,
        file: base64File
          ? {
              base64: base64File,
            }
          : undefined,
        chatId: chatId,
      });
      
      // Add AI response
      newElements.push(
        <div className="message-enter animate-in slide-in-from-bottom-4 duration-500">
          {element.ui}
        </div>,
      );

      setElements(newElements);
      setInput("");
      setSelectedFile(null);
      
      // Increment chat count after successful message - only for non-authenticated users
      if (!user) {
        incrementChat();
        
        // Show remaining chats warning if getting close to limit - only for non-authenticated users
        const remaining = getRemainingChats();
        if (remaining <= 2 && remaining > 0) {
          toast.warning(`You have ${remaining} chat${remaining === 1 ? '' : 's'} remaining.`);
        } else if (remaining === 0) {
          toast.error("Please sign in to continue chatting.");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Check if it's a body size limit error
      if (error instanceof Error && error.message.includes("Body exceeded 1 MB limit")) {
        toast.error("File size too large. Please select a smaller image file (under 1MB).");
      } else {
        ErrorHandler.handleGeneralError(error instanceof Error ? error : "Failed to send message", "Message sending");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Limit reached overlay
  const limitReached = isLimitReached();

  return (
    <div className="h-screen bg-background flex relative overflow-hidden">
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <Header onNewChat={handleNewChat} />
        
        {/* Main Chat Area */}
        <main className={`flex-1 flex flex-col max-w-7xl mx-auto w-full ${hasInteracted ? '' : 'justify-center'} relative z-10`}>
          {/* Messages Container - Only show when there are messages or user is typing */}
          {hasInteracted && (
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pr-4"
            >
              {/* Date Divider */}
              {elements.length > 0 && (
                <div className="flex items-center justify-center">
                  <div className="px-4 py-2 rounded-full bg-muted text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}
                  </div>
                </div>
              )}

              {/* Messages */}
              {elements.map((element, index) => (
                <div key={`message-${index}`}>
                  {element}
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && <AISkeletonLoading />}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Welcome Message - Only show when no interaction */}
          {!hasInteracted && (
            <div className="text-center px-6 py-12">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Auralux Multimodal AI</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                A powerful AI assistant that combines text, image and audio processing capabilities with a comprehensive suite of tools for enhanced productivity and creativity.
              </p>
              
              {/* Quick Actions */}
              <QuickActions onActionClick={handleSuggestionClick} />
            </div>
          )}

          {/* Input Area */}
          <div className={`border-t border-border p-6 flex-shrink-0 ${!hasInteracted ? 'mt-auto' : ''} relative z-20 bg-background`}>
            {/* Suggestion Questions - only show when no messages and not typing */}
            {!hasInteracted && (
              <SuggestionQuestions onQuestionClick={handleSuggestionClick} />
            )}
            
            <form
              ref={formRef}
              onSubmit={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                await onSubmit(input);
              }}
              className="flex items-end space-x-3"
            >
              {/* File Upload */}
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="icon"
                className="rounded-xl"
                title="Upload image"
                disabled={!user && limitReached}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {/* Text Input */}
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim()) {
                        onSubmit(input.trim());
                      }
                    }
                  }}
                  placeholder="Type your message..."
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  disabled={isLoading || (!user && limitReached)}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 bottom-2 h-8 w-8 p-0"
                  disabled={!input.trim() || isLoading || (!user && limitReached)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
