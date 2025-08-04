"use client";

import { useState, useRef, useEffect } from "react";
import { useActions } from "ai/rsc";
import { HumanMessageText, AISkeletonLoading } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/Header";
import { useChatStore } from "@/lib/chat-store";

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
          className="h-auto p-4 flex flex-col items-center space-y-2 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="text-xs font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default function Home() {
  const { sendMessage } = useActions();
  const { incrementChat, isLimitReached, getRemainingChats } = useChatStore();

  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  useEffect(() => inputRef.current?.focus(), []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Check if user has interacted (typing or has messages)
  useEffect(() => {
    setHasInteracted(input.length > 0 || elements.length > 0);
  }, [input, elements.length]);

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      ErrorHandler.handleValidationError("File type", "Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 1) {
      toast.error(`File size must be less than 1MB. Current size: ${fileSizeInMB.toFixed(2)}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleSuggestionClick = (question: string, shouldAutoSubmit: boolean = false) => {
    if (isLimitReached()) {
      toast.error("You've reached your chat limit. Please upgrade to continue chatting.");
      return;
    }
    
    setInput(question);
    setHasInteracted(true);
    
    if (shouldAutoSubmit) {
      // Auto-submit after a short delay to ensure input is set
      setTimeout(() => {
        onSubmit(question);
      }, 100);
    } else {
      // Just focus the input after setting the value
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleNewChat = () => {
    if (isLimitReached()) {
      toast.error("You've reached your chat limit. Please upgrade to continue chatting.");
      return;
    }
    
    setElements([]);
    setInput("");
    setSelectedFile(undefined);
    setHasInteracted(false);
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  async function onSubmit(prompt: string) {
    if (!prompt || isLoading) return;

    // Check if limit is reached
    if (isLimitReached()) {
      toast.error("You've reached your chat limit. Please upgrade to continue chatting.");
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

    // Add user message to the chat
    newElements.push(
      <div className="message-enter animate-in slide-in-from-bottom-4 duration-500">
        {selectedFile && (
          <div className="mb-4 rounded-xl overflow-hidden border border-border/50 shadow-lg">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Uploaded image"
              className="w-full max-w-2xl h-auto object-cover"
            />
          </div>
        )}
        <HumanMessageText content={prompt} />
      </div>
    );

    // Update elements immediately to show user message
    setElements(newElements);

    try {
      const element = await sendMessage({
        prompt,
        file: base64File
          ? {
              base64: base64File,
            }
          : undefined,
      });
      
      // Add AI response
      newElements.push(
        <div className="message-enter animate-in slide-in-from-bottom-4 duration-500">
          {element.ui}
        </div>,
      );

      setElements(newElements);
      setInput("");
      setSelectedFile(undefined);
      
      // Increment chat count after successful message
      incrementChat();
      
      // Show remaining chats warning if getting close to limit
      const remaining = getRemainingChats();
      if (remaining <= 2 && remaining > 0) {
        toast.warning(`You have ${remaining} chat${remaining === 1 ? '' : 's'} remaining.`);
      } else if (remaining === 0) {
        toast.error("You've reached your chat limit. Please upgrade to continue chatting.");
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
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <Header onNewChat={handleNewChat} />

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col max-w-7xl mx-auto w-full pt-20 ${hasInteracted ? '' : 'justify-center'}`}>
        {/* Limit Reached Overlay */}
        {limitReached && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-background border border-border rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Chat Limit Reached</h3>
              <p className="text-muted-foreground mb-6">
                You've used all 5 free chats. Upgrade to continue using our AI assistant with unlimited conversations.
              </p>
              <Button className="w-full">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Messages Container - Only show when there are messages or user is typing */}
        {hasInteracted && (
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
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
        <div className={`border-t border-border p-6 flex-shrink-0 ${!hasInteracted ? 'mt-auto' : ''}`}>
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
              disabled={limitReached}
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
                placeholder={limitReached ? "Chat limit reached" : "Ask anything..."}
                className="min-h-[44px] max-h-32 resize-none rounded-xl"
                rows={1}
                disabled={limitReached}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!limitReached) {
                      formRef.current?.requestSubmit();
                    }
                  }
                }}
              />
              {selectedFile && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || limitReached}
              size="icon"
              className="rounded-xl"
              title={limitReached ? "Chat limit reached" : "Send message"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </form>

          {/* File Preview */}
          {selectedFile && (
            <div className="mt-3 p-3 rounded-xl bg-muted border border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setSelectedFile(undefined)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
