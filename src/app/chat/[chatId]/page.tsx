"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AISkeletonLoading } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/ui/Header";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { use } from "react";
import { getChat } from "@/app/actions/chatActions";
import { FilePreview } from "@/components/ui/file-preview";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { ChatImage } from "@/components/ui/chat-image";
import { Actions, Action } from "@/components/ui/actions";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { WeatherCard } from "@/components/ui/weather";
import { Markdown } from "@/components/ui/markdown";

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
}

interface AttachmentMeta {
  name: string;
  mimeType: string;
  url: string;
  type: 'image' | 'file';
  width?: number | null;
  height?: number | null;
  size?: number;
  extractedTextPreview?: string | null;
}

function tryParseAttachmentFromContent(content: string): AttachmentMeta | null {
  try {
    // First try to find the old format with __attachment
    const attachmentMatch = content.match(/\{"__attachment"[\s\S]*\}$/);
    if (attachmentMatch) {
      const attachmentData = JSON.parse(attachmentMatch[0]);
      return attachmentData;
    }
    
    // Try to find the new format where attachment metadata is appended as JSON
    const lines = content.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const parsed = JSON.parse(line);
          // Check if this looks like attachment metadata
          if (parsed.name && parsed.url && (parsed.type === 'image' || parsed.type === 'file')) {
            return parsed as AttachmentMeta;
          }
        } catch {}
      }
    }
  } catch {}
  return null;
}

/**
 * Cleans message content by removing attachment metadata
 */
function cleanMessageContent(content: string): string {
  // Remove old format attachment metadata
  const cleaned = content.replace(/\n?\{\"__attachment\"[\s\S]*\}$/,'');
  
  // Remove new format attachment metadata (JSON at the end)
  const lines = cleaned.split('\n');
  const cleanLines = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        // If this looks like attachment metadata, filter it out
        if (parsed.name && parsed.url && (parsed.type === 'image' || parsed.type === 'file')) {
          return false;
        }
      } catch {}
    }
    return true;
  });
  
  return cleanLines.join('\n').trim();
}

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const resolvedParams = use(params);
  const chatId = resolvedParams.chatId;
  
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewChat, setIsNewChat] = useState(false);
  const user = useUser();
  const router = useRouter();
  const [messagesContainerRef, messagesEndRef, scrollToBottom] = useScrollToBottom<HTMLDivElement>();
  const [pendingAttachment, setPendingAttachment] = useState<AttachmentMeta | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // Check if this is a new chat with initial message
    const urlParams = new URLSearchParams(window.location.search);
    const initialMessage = urlParams.get('message');
    
    if (initialMessage) {
      // This is a new chat with initial message - skip loading existing chat
      setIsNewChat(true);
      setLoading(false);
      setChat({ id: chatId, title: initialMessage.substring(0, 50) + (initialMessage.length > 50 ? "..." : ""), messages: [], createdAt: new Date(), updatedAt: new Date() });
      
      // Process the initial message immediately
      setTimeout(() => {
        onSubmit(initialMessage);
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 50);
    } else {
      // This is an existing chat - fetch the data
      fetchChat();
    }
  }, [chatId, user]);

  const fetchChat = async () => {
    try {
      console.log('🔍 Client: Fetching chat via server action:', chatId);
      const result = await getChat(chatId);
      
      if (result.success && result.data) {
        const chatData = result.data;
        console.log('✅ Client: Chat fetched successfully via server action');
        
        // Transform the data to match the Chat interface
        const transformedChat: Chat = {
          id: chatData.id,
          title: chatData.title,
          messages: chatData.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            createdAt: msg.createdAt
          })),
          createdAt: chatData.createdAt,
          updatedAt: chatData.updatedAt
        };
        
        setChat(transformedChat);
        
        // Convert existing messages to UI elements
        const messageElements = transformedChat.messages.map((message: Message) => {
          if (message.role === "user") {
            const att = tryParseAttachmentFromContent(message.content);
            return (
              <div key={message.id} className="flex justify-end mb-1 animate-in slide-in-from-right-2 duration-300">
                <div className="flex flex-col items-end space-y-2 max-w-[70%]">
                  {att && (
                    <div className="mb-4">
                      {att.type === 'image' ? (
                        <ChatImage 
                          src={att.url} 
                          alt={att.name}
                          className="mb-4"
                          size="md"
                        />
                      ) : (
                        <FilePreview 
                          file={{
                            name: att.name,
                            mimeType: att.mimeType,
                            url: att.url,
                            type: att.type,
                            width: att.width,
                            height: att.height,
                            size: att.size,
                          }}
                        />
                      )}
                    </div>
                  )}
                  <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-purple-600 text-white shadow-lg border border-violet-600/20 backdrop-blur-sm">
                    <div className="text-sm leading-relaxed font-medium">
                      {cleanMessageContent(message.content)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={message.id} className="flex justify-start mb-1 animate-in slide-in-from-left-2 duration-300 group">
                <div className="flex flex-col items-start space-y-2 max-w-[85%]">
                  <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
                    {renderMessageContent(message.content)}
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
      } else {
        console.error("❌ Client: Failed to fetch chat via server action:", result.error);
        toast.error(result.error || "Failed to load chat");
        router.push("/");
      }
    } catch (error) {
      console.error("❌ Client: Error fetching chat via server action:", error);
      toast.error("Failed to load chat");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('file', file);
      const res = await fetch(`/api/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setPendingAttachment({
        name: data.attachment.name,
        mimeType: data.attachment.mimeType,
        url: data.attachment.url,
        type: data.attachment.type,
        width: data.attachment.width,
        height: data.attachment.height,
        size: data.attachment.size,
        extractedTextPreview: data.attachment.extractedTextPreview,
      });
      toast.success('File uploaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = useCallback(async (prompt: string) => {
    console.log("onSubmit called with prompt:", prompt);
    console.log("User:", user);
    console.log("Is loading:", isLoading);
    
    if (!prompt || isLoading || !user) return;

    console.log("Starting message submission...");
    setIsLoading(true);
    const newElements = [...elements];

    // Add user message to the chat
    newElements.push(
      <div key={`user-${Date.now()}`} className="flex justify-end mb-1 animate-in slide-in-from-right-2 duration-300">
        <div className="flex flex-col items-end space-y-2 max-w-[70%]">
          {pendingAttachment && (
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
                    mimeType: pendingAttachment.mimeType,
                    url: pendingAttachment.url,
                    type: pendingAttachment.type,
                    width: pendingAttachment.width,
                    height: pendingAttachment.height,
                    size: pendingAttachment.size,
                  }}
                  onRemove={() => setPendingAttachment(null)}
                />
              )}
            </div>
          )}
          <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-purple-600 text-white shadow-lg border border-violet-600/20 backdrop-blur-sm">
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
    
    // Trigger scroll to bottom immediately after adding user message
    setTimeout(scrollToBottom, 10);

    try {
      // Start streaming API call
      const requestBody: any = {
        chatId, // ensure API can persist messages
        messages: [
          { role: 'user', content: prompt },
        ],
      };

      // Include attachment metadata if present
      if (pendingAttachment) {
        requestBody.attachmentMeta = {
          name: pendingAttachment.name,
          mimeType: pendingAttachment.mimeType,
          url: pendingAttachment.url,
          type: pendingAttachment.type,
          width: pendingAttachment.width,
          height: pendingAttachment.height,
          extractedTextPreview: pendingAttachment.extractedTextPreview,
        };
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.body) {
        throw new Error('No response body');
      }

      // Create a placeholder AI element that we will update as chunks arrive
      let aiText = '';
      let weatherPayload: any | null = null;
      const renderAI = (text: string, weather: any | null) => (
        <div key={`ai-${Date.now()}`} className="flex justify-start mb-1 animate-in slide-in-from-left-2 duration-300 group">
          <div className="flex flex-col items-start space-y-2 max-w-[85%]">
            {weather ? (
              <WeatherCard data={weather} />
            ) : null}
            <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
              <Markdown>{text}</Markdown>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Actions className="mt-2">
                <Action onClick={() => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); }} label="Copy">
                  <Copy className="size-3" />
                </Action>
                <Action onClick={() => toast.success('Message liked')} label="Like">
                  <ThumbsUp className="size-3" />
                </Action>
                <Action onClick={() => toast.success('Message disliked')} label="Dislike">
                  <ThumbsDown className="size-3" />
                </Action>
                <Action onClick={() => toast.success('Regenerating response...')} label="Redo">
                  <RotateCcw className="size-3" />
                </Action>
              </Actions>
            </div>
          </div>
        </div>
      );

      newElements.push(renderAI(aiText, weatherPayload));
      setElements([...newElements]);
      setTimeout(scrollToBottom, 10);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // Extract weather marker lines if present
        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.startsWith('UI_WEATHER:')) {
            try {
              const payload = JSON.parse(line.replace('UI_WEATHER:', ''));
              weatherPayload = payload;
            } catch {}
            continue;
          }
          aiText += line + '\n';
          setElements((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = renderAI(aiText, weatherPayload);
            return updated;
          });
          setTimeout(scrollToBottom, 5);
        }
      }
      // Flush any remainder
      if (buffer.length) {
        aiText += buffer;
        setElements((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = renderAI(aiText, weatherPayload);
          return updated;
        });
        setTimeout(scrollToBottom, 10);
      }

      // Finalize
      setInput("");
      setPendingAttachment(null);
      setTimeout(scrollToBottom, 10);
    } catch (error) {
      console.error("Error sending message:", error);
      
      if (error instanceof Error && error.message.includes("Body exceeded 1 MB limit")) {
        toast.error("File size too large. Please select a smaller image file (under 1MB).");
      } else {
        ErrorHandler.handleGeneralError(error instanceof Error ? error : "Failed to send message", "Message sending");
      }
    } finally {
      setIsLoading(false);
    }
  }, [chatId, elements, pendingAttachment, scrollToBottom, isLoading, user]);

  function renderMessageContent(content: string) {
    // Handle UI markers persisted in DB (e.g., UI_WEATHER:{...})
    if (content.startsWith('UI_WEATHER:')) {
      const nl = content.indexOf('\n');
      const jsonLine = nl === -1 ? content : content.slice(0, nl);
      const rest = nl === -1 ? '' : content.slice(nl + 1);
      const jsonStr = jsonLine.replace('UI_WEATHER:', '').trim();
      try {
        const payload = JSON.parse(jsonStr);
        return (
          <div className="space-y-3">
            <WeatherCard data={payload} />
            {rest ? (
              <Markdown>{rest}</Markdown>
            ) : null}
          </div>
        );
      } catch {}
    }

    // Back-compat: if content looks like a plain weather JSON, render it nicely
    try {
      const parsed = JSON.parse(content);
      if (
        typeof parsed === 'object' && parsed !== null &&
        (parsed.temp_c !== undefined || parsed.condition || parsed.icon) &&
        (parsed.location || parsed.region || parsed.country)
      ) {
        return <WeatherCard data={parsed} />;
      }
      if (parsed.type === 'tool-call') {
        return (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Tool Call</span>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{parsed.toolName}</pre>
          </div>
        );
      }
    } catch {}

    return <Markdown>{content}</Markdown>;
  }

  if (loading && !isNewChat) {
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

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={messagesContainerRef}
            data-messages-container
            className="h-full overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto scrollbar-hide"
          >
            {elements.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-semibold mb-2">{chat?.title}</h2>
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
            {isLoading && <AISkeletonLoading />}
            
            <div ref={messagesEndRef} data-messages-end />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-border bg-background input-area">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {/* File preview area */}
            {pendingAttachment && (
              <div className="animate-in slide-in-from-top-4 duration-300">
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
                      mimeType: pendingAttachment.mimeType,
                      url: pendingAttachment.url,
                      type: pendingAttachment.type,
                      width: pendingAttachment.width,
                      height: pendingAttachment.height,
                      size: pendingAttachment.size,
                    }}
                    onRemove={() => setPendingAttachment(null)}
                  />
                )}
              </div>
            )}
            
            <div className="flex items-end gap-3">
              <AttachmentButton
                onFileSelect={handleFileSelect}
                disabled={isLoading}
                uploading={uploading}
              />
              
              <Textarea
                placeholder="Type your message..."
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
                className="min-h-[60px] max-h-[200px] resize-none flex-1"
                disabled={isLoading}
              />
              
              <Button
                onClick={() => onSubmit(input.trim())}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="h-[60px] px-6"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}