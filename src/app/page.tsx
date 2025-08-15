"use client";

import React, { useCallback, Suspense } from "react";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { AISkeletonLoading } from "@/components/message";
import { Header } from "@/components/ui/Header";
import { ChatInput, WelcomeMessage } from "@/components/chat";
import { useChat } from "@/hooks/use-chat";
import { ErrorBoundary } from "@/components/error-boundary";
import { WelcomeSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

// Lazy load components for better performance
const VirtualMessageList = React.lazy(() => 
  import("@/components/chat/virtual-message-list").then(module => ({ 
    default: module.VirtualMessageList 
  }))
);

const SignInPrompt = () => (
  <div className="flex-1 flex items-center justify-center px-6">
    <div className="text-center max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to AI Chat</h1>
        <p className="text-muted-foreground">
          Sign in to start chatting with our AI assistant. Get personalized responses, 
          upload files, and maintain conversation context across sessions.
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={() => window.location.href = "/auth/signin"} 
          size="lg" 
          className="w-full"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In to Continue
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a 
            href="/auth/signup" 
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
      
      <div className="pt-6 border-t">
        <h3 className="font-semibold mb-3">Features you&apos;ll get:</h3>
        <ul className="text-sm text-muted-foreground space-y-2 text-left">
          <li>• Full conversation context and history</li>
          <li>• File upload and analysis</li>
          <li>• Weather information and tools</li>
          <li>• Personalized chat experience</li>
          <li>• Secure and private conversations</li>
        </ul>
      </div>
    </div>
  </div>
);

const ChatContent = React.memo(() => {
  const {
    elements,
    input,
    setInput,
    isLoading,
    hasInteracted,
    uploading,
    user,
    handleFileSelect,
    handleNewChat,
    onSubmit,
    error,
    clearError,
  } = useChat();

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const handleSuggestionClick = useCallback((question: string, shouldAutoSubmit: boolean = false) => {
    setInput(question);
    if (shouldAutoSubmit) {
      setTimeout(() => {
        onSubmit(question);
      }, 100);
    }
  }, [setInput, onSubmit]);

  // Show sign-in prompt for unauthenticated users
  if (!user) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <ErrorBoundary>
          <Header onNewChat={handleNewChat} />
        </ErrorBoundary>
        <SignInPrompt />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md mx-auto space-y-4">
          <div className="text-red-500 text-lg font-semibold">Something went wrong</div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <ErrorBoundary>
        <Header onNewChat={handleNewChat} />
      </ErrorBoundary>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          {hasInteracted ? (
            <div 
              ref={messagesContainerRef}
              data-messages-container
              className="h-full overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto scrollbar-hide"
            >
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

              {/* Messages with virtual scrolling for large lists */}
              {elements.length > 50 ? (
                <Suspense fallback={<div>Loading messages...</div>}>
                  <VirtualMessageList
                    elements={elements}
                    isLoading={isLoading}
                    containerRef={messagesContainerRef}
                  />
                </Suspense>
              ) : (
                /* Regular rendering for smaller lists */
                elements.map((element, index) => (
                  <div key={`message-${index}`}>
                    {element}
                  </div>
                ))
              )}
              
              {/* Loading Indicator */}
              {isLoading && <AISkeletonLoading />}
              
              <div ref={messagesEndRef} data-messages-end />
            </div>
          ) : (
            /* Welcome Message - Only show when no interaction */
            <Suspense fallback={<WelcomeSkeleton />}>
              <WelcomeMessage 
                userName={user?.name || user?.email || "User"} 
                onActionClick={handleSuggestionClick} 
              />
            </Suspense>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <ErrorBoundary>
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={onSubmit}
            onFileSelect={handleFileSelect}
            isLoading={isLoading}
            hasInteracted={hasInteracted}
            limitReached={false}
            uploading={uploading}
            user={user}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
});

ChatContent.displayName = 'ChatContent';

export default function Home() {
  return (
    <ErrorBoundary>
      <ChatContent />
    </ErrorBoundary>
  );
}
