import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { Attachment } from "@/types/chat";
import { User, UploadResponse } from "@/types/api";
import { ERROR_MESSAGES } from "@/lib/constants";
import { ChatMessage } from "@/components/chat/chat-message";
import { createChat } from "@/app/actions/chatActions";

interface ChatState {
  elements: React.ReactNode[];
  input: string;
  isLoading: boolean;
  hasInteracted: boolean;
  currentChatId: string | null;
  pendingAttachment: Attachment | null;
  uploading: boolean;
  error: string | null;
}

interface ChatActions {
  setElements: (elements: React.ReactNode[]) => void;
  setInput: (input: string) => void;
  setPendingAttachment: (attachment: Attachment | null) => void;
  handleFileSelect: (file: File) => Promise<void>;
  handleNewChat: () => Promise<void>;
  onSubmit: (prompt: string) => Promise<void>;
  clearError: () => void;
  user: User | null;
}

/**
 * Custom hook for managing chat state and operations
 * @returns Chat state and operations
 */
export const useChat = (): ChatState & ChatActions => {
  const [state, setState] = useState<ChatState>({
    elements: [],
    input: "",
    isLoading: false,
    hasInteracted: false,
    currentChatId: null,
    pendingAttachment: null,
    uploading: false,
    error: null,
  });
  
  const user = useUser();
  const router = useRouter();

  // Error handling utility
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`❌ Error in ${context}:`, error);
    
    let errorMessage: string = ERROR_MESSAGES.NETWORK_ERROR;
    
    if (error instanceof Error) {
      // Check for Gemini API quota errors
      const errorStr = error.message.toLowerCase();
      if (errorStr.includes('quota') || errorStr.includes('resource_exhausted')) {
        if (errorStr.includes('per day') || errorStr.includes('daily')) {
          errorMessage = ERROR_MESSAGES.DAILY_QUOTA_EXCEEDED;
        } else if (errorStr.includes('per minute') || errorStr.includes('rate')) {
          errorMessage = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
        } else {
          errorMessage = ERROR_MESSAGES.QUOTA_EXCEEDED;
        }
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = "Please sign in to continue.";
        router.push("/sign-in");
      } else {
        errorMessage = error.message;
      }
    }
    
    setState(prev => ({ ...prev, error: errorMessage }));
    toast.error(errorMessage);
  }, [router]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Create message element
  const createMessageElement = useCallback((content: string, isUser: boolean, attachment?: Attachment | null) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const element = React.createElement(ChatMessage, {
      key: `${isUser ? 'user' : 'ai'}-${Date.now()}-${Math.random()}`,
      isUser: isUser,
      content: content,
      timestamp: timestamp,
      attachment: attachment,
      onRemoveAttachment: () => {
        setState(prev => ({ ...prev, pendingAttachment: null }));
      }
    });
    
    return element;
  }, []);

  // File upload without validation
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      if (!user) {
        // Save file info to localStorage for unauthenticated users
        const savedFiles = JSON.parse(localStorage.getItem('pendingFiles') || '[]');
        const fileInfo = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          timestamp: new Date().toISOString()
        };
        savedFiles.push(fileInfo);
        localStorage.setItem('pendingFiles', JSON.stringify(savedFiles));
        
        // Redirect to sign-in page
        router.push("/sign-in");
        return;
      }

      setState(prev => ({ ...prev, uploading: true, error: null }));

      // Ensure chat exists for auth flow using server action
      let ensuredChatId = state.currentChatId;
      if (!ensuredChatId) {
        console.log('🔍 Client: Creating chat via server action for file upload');
        const chatResult = await createChat("New Chat");
        
        if (!chatResult.success) {
          throw new Error(chatResult.error || "Failed to create chat");
        }
        
        ensuredChatId = chatResult.data?.id || null;
        setState(prev => ({ ...prev, currentChatId: ensuredChatId }));
        if (ensuredChatId) {
          router.push(`/chat/${ensuredChatId}`);
        }
      }

      // Upload file
      const form = new FormData();
      form.append('chatId', ensuredChatId!);
      form.append('file', file);
      
      const response = await fetch('/api/upload', { 
        method: 'POST', 
        body: form 
      });
      
      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
      }

      const data: UploadResponse = await response.json();
      
      setState(prev => ({
        ...prev,
        pendingAttachment: {
          id: data.attachment.id,
          name: data.attachment.name,
          url: data.attachment.url,
          type: data.attachment.type,
          mimeType: data.attachment.mimeType,
          size: data.attachment.size,
          extractedTextPreview: data.attachment.extractedTextPreview,
        },
        uploading: false,
      }));

      console.log('✅ Client: File uploaded successfully via server action');
      toast.success('File uploaded successfully');
    } catch (error) {
      handleError(error, 'file upload');
      setState(prev => ({ ...prev, uploading: false }));
    }
  }, [state.currentChatId, router, handleError, user]);

  // Create new chat
  const handleNewChat = useCallback(async () => {
    try {
      if (!user) {
        // Redirect to sign-in page for unauthenticated users
        router.push("/sign-in");
        return;
      }
      
      console.log('🔍 Client: Creating new chat via server action');
      
      // Create new chat for authenticated users using server action
      const chatResult = await createChat("New Chat");
      
      if (!chatResult.success) {
        throw new Error(chatResult.error || "Failed to create chat");
      }
      
      console.log('✅ Client: New chat created successfully via server action');
      if (chatResult.data?.id) {
        router.push(`/chat/${chatResult.data.id}`);
      }
    } catch (error) {
      handleError(error, 'chat creation');
    }
  }, [user, router, handleError]);

  // Submit message without validation
  const onSubmit = useCallback(async (prompt: string) => {
    try {
      // Check authentication first
      if (!user) {
        // Save message to localStorage for unauthenticated users
        const savedMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
        const newMessage = {
          id: Date.now().toString(),
          content: prompt.trim(),
          timestamp: new Date().toISOString(),
          attachment: state.pendingAttachment
        };
        savedMessages.push(newMessage);
        localStorage.setItem('pendingMessages', JSON.stringify(savedMessages));
        
        // Redirect to sign-in page
        router.push("/sign-in");
        return;
      }

      // Simple check for empty prompt
      if (!prompt || !prompt.trim()) {
        toast.error('Please enter a message');
        return;
      }

      if (state.isLoading) return;

      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        hasInteracted: true,
        error: null 
      }));

      // Create chat if we don't have one yet using server action
      let chatId: string | undefined = state.currentChatId || undefined;
      if (!chatId) {
        const title = prompt.substring(0, 50) + (prompt.length > 50 ? "..." : "");
        console.log('🔍 Client: Creating chat via server action for message submission');
        
        const chatResult = await createChat(title);
        
        if (!chatResult.success) {
          throw new Error(chatResult.error || "Failed to create chat");
        }
        
        chatId = chatResult.data?.id;
        if (chatId) {
          setState(prev => ({ ...prev, currentChatId: chatId as string | null }));
        }
        
        console.log('✅ Client: Chat created successfully via server action for message');
        
        // Immediately redirect to chat page with message parameter
        // This eliminates the double loading and makes the flow seamless
        router.push(`/chat/${chatId}?message=${encodeURIComponent(prompt)}`);
        return; // Exit early, chat page will handle the message immediately
      }

      // If we already have a chatId, redirect to that chat with the message
      router.push(`/chat/${chatId}?message=${encodeURIComponent(prompt)}`);
    } catch (error) {
      handleError(error, 'message submission');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [
    state.isLoading, 
    state.currentChatId, 
    state.pendingAttachment, 
    user, 
    router, 
    handleError
  ]);

  // State setters
  const setElements = useCallback((elements: React.ReactNode[]) => {
    setState(prev => ({ ...prev, elements }));
  }, []);

  const setInput = useCallback((input: string) => {
    // Ensure input is always a string
    const sanitizedInput = String(input || '');
    setState(prev => ({ ...prev, input: sanitizedInput }));
  }, []);

  const setPendingAttachment = useCallback((attachment: Attachment | null) => {
    setState(prev => ({ ...prev, pendingAttachment: attachment }));
  }, []);

  return {
    ...state,
    setElements,
    setInput,
    setPendingAttachment,
    handleFileSelect,
    handleNewChat,
    onSubmit,
    clearError,
    user,
  };
};