"use client";

import React, { useCallback, Suspense } from "react";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { AISkeletonLoading } from "@/components/message";
import { Header } from "@/components/ui/Header";
import { ChatInput, WelcomeMessage } from "@/components/chat";
import { useChat } from "@/hooks/use-chat";
import { ErrorBoundary } from "@/components/error-boundary";
import { WelcomeSkeleton } from "@/components/loading-skeleton";

// Lazy load components for better performance
const VirtualMessageList = React.lazy(() => 
  import("@/components/chat/virtual-message-list").then(module => ({ 
    default: module.VirtualMessageList 
  }))
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
      }, 50);
    }
  }, [setInput, onSubmit]);

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
        <Header />
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
