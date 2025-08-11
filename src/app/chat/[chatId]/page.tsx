"use client";

import { useState, useRef, useEffect } from "react";
import { useActions } from "ai/rsc";
import { HumanMessageText, AISkeletonLoading, AIMessageText } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/ui/Header";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { use } from "react";
import axios from "axios";
import { ChartJS } from "@/components/ui/chart";
import { Weather } from "@/components/ui/weather";
import { Video } from "@/components/ui/video";
import { GeminiImage } from "@/components/ui/image";

interface Message {
  id: string;
  content: string;
  role: string;
  createdAt: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to detect and parse chart data from message content
function parseChartData(content: string) {
  try {
    // Check if content contains chart data structure
    if (content.includes('"type":') && content.includes('"data":') && content.includes('"title":')) {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const chartData = JSON.parse(jsonMatch[0]);
        if (chartData.type && chartData.data && chartData.title) {
          return {
            title: chartData.title,
            type: chartData.type,
            data: chartData.data
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing chart data:", error);
    return null;
  }
}

// Helper function to detect and parse weather data from message content
function parseWeatherData(content: string) {
  try {
    // Check if content contains weather data structure
    if (content.includes('"location":') && content.includes('"current":')) {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const weatherData = JSON.parse(jsonMatch[0]);
        if (weatherData.location && weatherData.current) {
          return weatherData;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing weather data:", error);
    return null;
  }
}

// Helper function to detect and parse video data from message content
function parseVideoData(content: string) {
  try {
    // Check if content contains video data structure
    if (content.includes('"videoId":') || content.includes('"items":')) {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const videoData = JSON.parse(jsonMatch[0]);
        if (videoData.items && videoData.items.length > 0 && videoData.items[0].id?.videoId) {
          return videoData.items[0].id.videoId;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing video data:", error);
    return null;
  }
}

// Helper function to detect and parse image data from message content
function parseImageData(content: string) {
  try {
    // Check if content contains image data structure
    if (content.includes('"type": "image"')) {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const imageData = JSON.parse(jsonMatch[0]);
        if (imageData.type === "image") {
          // Prefer Cloudinary URL if available, otherwise fall back to original data
          if (imageData.cloudinary && imageData.cloudinary.secure_url) {
            return imageData.cloudinary.secure_url;
          } else if (imageData.originalData) {
            return imageData.originalData;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing image data:", error);
    return null;
  }
}

// Helper function to render message content
function renderMessageContent(content: string) {
  // Check if this is chart data
  const chartData = parseChartData(content);
  if (chartData) {
    return <ChartJS {...chartData} />;
  }
  
  // Check if this is weather data
  const weatherData = parseWeatherData(content);
  if (weatherData) {
    return <Weather {...weatherData} />;
  }
  
  // Check if this is video data
  const videoId = parseVideoData(content);
  if (videoId) {
    return <Video videoId={videoId} />;
  }
  
  // Check if this is image data
  const imageUrl = parseImageData(content);
  if (imageUrl) {
    return <GeminiImage url={imageUrl} />;
  }
  
  // Regular text content
  return <AIMessageText content={content} />;
}

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

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const resolvedParams = use(params);
  const chatId = resolvedParams.chatId;
  
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const router = useRouter();
  const { sendMessage } = useActions();
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    fetchChat();
  }, [chatId, user]);

  // Handle initial message from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialMessage = urlParams.get('message');
    
    console.log("Initial message from URL:", initialMessage);
    console.log("User state:", user);
    console.log("Loading state:", loading);
    console.log("Elements length:", elements.length);
    
    if (initialMessage && user && !loading && elements.length === 0) {
      console.log("Processing initial message:", initialMessage);
      onSubmit(initialMessage);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, loading, elements.length]);

  const fetchChat = async () => {
    try {
      const response = await axios.get(`/api/chats/${chatId}`);
      if (response.status === 200) {
        const chatData = response.data;
        setChat(chatData);
        
        // Convert existing messages to UI elements
        const messageElements = chatData.messages.map((message: Message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="message-enter animate-in slide-in-from-bottom-4 duration-500">
                <HumanMessageText content={message.content} />
              </div>
            );
          } else {
            return (
              <div key={message.id} className="message-enter animate-in slide-in-from-bottom-4 duration-500">
                {renderMessageContent(message.content)}
              </div>
            );
          }
        });
        
        setElements(messageElements);
      } else {
        toast.error("Failed to load chat");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      toast.error("Failed to load chat");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleNewChat = () => {
    router.push("/");
  };

  async function onSubmit(prompt: string) {
    console.log("onSubmit called with prompt:", prompt);
    console.log("User:", user);
    console.log("Is loading:", isLoading);
    
    if (!prompt || isLoading || !user) return;

    console.log("Starting message submission...");
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
      <div key={`user-${Date.now()}`} className="message-enter animate-in slide-in-from-bottom-4 duration-500">
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

    try {
      console.log("Sending message with chatId:", chatId);
      const element = await sendMessage({
        prompt,
        file: base64File
          ? {
              base64: base64File,
            }
          : undefined,
        chatId: chatId,
      });
      
      console.log("Message sent successfully, element:", element);
      console.log("ChatId used:", chatId);
      
      // Add AI response
      newElements.push(
        <div key={`ai-${Date.now()}`} className="message-enter animate-in slide-in-from-bottom-4 duration-500">
          {element.ui}
        </div>,
      );

      setElements(newElements);
      setInput("");
      setSelectedFile(null);
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
  }

  if (loading) {
    return (
      <div className="h-screen bg-background flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen bg-background flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Chat not found</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <Header onNewChat={handleNewChat} />
        
        {/* Chat Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pr-4 relative z-10"
        >
          {elements.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-2">{chat.title}</h2>
                <p className="text-muted-foreground">
                  Start a conversation with your AI assistant
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
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background relative z-20">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-end gap-2">
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
                className="min-h-[60px] max-h-[200px] resize-none"
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