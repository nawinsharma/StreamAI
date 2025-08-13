"use client";

import { useState, useRef } from "react";
// Removed: import { useActions } from "ai/rsc";
import { AISkeletonLoading } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/ui/Header";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/chat-store";
import axios from "axios";
import { FilePreview } from "@/components/ui/file-preview";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { ChatImage } from "@/components/ui/chat-image";
import { Actions, Action } from "@/components/ui/actions";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";

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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const user = useUser();
  const router = useRouter();
  // Removed: const { sendMessage } = useActions();
  const { incrementChat, isLimitReached, getRemainingChats } = useChatStore();
  const [messagesContainerRef, messagesEndRef, scrollToBottom] = useScrollToBottom<HTMLDivElement>();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pendingAttachment, setPendingAttachment] = useState<{ id: string; name: string; url: string; type: 'image' | 'file'; mimeType?: string; size?: number; extractedTextPreview?: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setUploading(true);
      // Ensure chat exists for auth flow so we can associate the upload
      let ensuredChatId = currentChatId;
      if (!ensuredChatId) {
        const r = await axios.post("/api/chats", { title: "New Chat" });
        ensuredChatId = r.data.id;
        setCurrentChatId(ensuredChatId);
        router.push(`/chat/${ensuredChatId}`);
      }
      const form = new FormData();
      form.append('chatId', ensuredChatId!);
      form.append('file', file);
      const res = await fetch(`/api/upload`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setPendingAttachment({ id: data.attachment.id ?? 'tmp', name: data.attachment.name, url: data.attachment.url, type: data.attachment.type, mimeType: data.attachment.mimeType, size: data.attachment.size, extractedTextPreview: data.attachment.extractedTextPreview });
      toast.success('File uploaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
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
      <div key={`user-${Date.now()}`} className="flex justify-end mb-6 animate-in slide-in-from-right-2 duration-300">
        <div className="flex flex-col items-end space-y-2 max-w-[85%]">
          {pendingAttachment ? (
            <div className="mb-4">
              {pendingAttachment.type === 'image' ? (
                <ChatImage 
                  src={pendingAttachment.url} 
                  alt={pendingAttachment.name}
                  className="mb-4"
                  size="sm"
                />
              ) : (
                <FilePreview 
                  file={{
                    name: pendingAttachment.name,
                    mimeType: pendingAttachment.mimeType || 'application/octet-stream',
                    url: pendingAttachment.url,
                    type: pendingAttachment.type,
                    width: null,
                    height: null,
                    size: pendingAttachment.size,
                  }}
                  onRemove={() => setPendingAttachment(null)}
                />
              )}
            </div>
          ) : null}
          <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border border-blue-600/20 backdrop-blur-sm">
            <div className="text-sm leading-relaxed font-medium">{prompt}</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    );

    // Update elements immediately to show user message
    setElements(newElements);
    setHasInteracted(true);
    
    // Trigger scroll to bottom after adding user message
    setTimeout(scrollToBottom, 50);

    try {
      const response = await axios.post("/api/chat", {
        prompt,
        file: undefined,
        chatId: chatId,
        attachmentText: pendingAttachment?.type !== 'image' ? pendingAttachment?.extractedTextPreview || undefined : undefined,
        attachmentMeta: pendingAttachment
          ? {
              name: pendingAttachment.name,
              mimeType: pendingAttachment.mimeType || 'application/octet-stream',
              url: pendingAttachment.url,
              type: pendingAttachment.type,
              width: null,
              height: null,
              size: pendingAttachment.size,
            }
          : undefined,
      });
      
      // Normalize UI content: support both { ui: string|ReactNode } and plain text responses
      const uiContent = (response?.data && typeof response.data === 'object' && 'ui' in response.data)
        ? (response.data as any).ui
        : response?.data;
      
      // Add AI response
      newElements.push(
        <div key={`ai-${Date.now()}`} className="flex justify-start mb-6 animate-in slide-in-from-left-2 duration-300 group">
          <div className="flex flex-col items-start space-y-2 max-w-[85%]">
            <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
              {typeof uiContent === 'string' ? (
                <Markdown>{uiContent}</Markdown>
              ) : (
                uiContent
              )}
            </div>
            
            {/* Actions - Show on hover - only if element.ui is not already a complete message component */}
            {typeof uiContent === 'string' && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Actions className="mt-2">
                  <Action
                    onClick={() => {
                      navigator.clipboard.writeText(uiContent as string);
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
            )}
          </div>
        </div>
      );

      setElements(newElements);
      setInput("");
      setPendingAttachment(null);
      
      // Trigger scroll to bottom after adding AI response
      setTimeout(scrollToBottom, 50);
      
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
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <Header onNewChat={handleNewChat} />
      
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
              
              <div ref={messagesEndRef} data-messages-end />
            </div>
          ) : (
            /* Welcome Message - Only show when no interaction */
            <div className="h-full flex items-center justify-center px-6">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Welcome {user ? user?.name : "User"}</h1>
                <p className="text-muted-foreground mb-8">
                  Start a conversation with your AI assistant. You can ask questions, analyze images, or get help with various tasks.
                </p>
                {/* Quick Actions */}
                <QuickActions onActionClick={handleSuggestionClick} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-border bg-background input-area">
          <div className="max-w-4xl mx-auto p-4">
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
              className="flex items-end gap-3"
            >
              {/* File Upload */}
              <AttachmentButton
                onFileSelect={handleFileSelect}
                disabled={!user && limitReached}
                uploading={uploading}
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
        </div>
      </div>
    </div>
  );
}
