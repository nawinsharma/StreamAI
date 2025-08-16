import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useUser } from "@/context/UserContext";
import { Attachment } from "@/types/chat";
import { User, UploadResponse, ChatCreateResponse } from "@/types/api";
import { ERROR_MESSAGES } from "@/lib/constants";
import { ChatMessage } from "@/components/chat/chat-message";

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
    console.error(`Error in ${context}:`, error);
    
    let errorMessage: string = ERROR_MESSAGES.NETWORK_ERROR;
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        errorMessage = "Please sign in to continue.";
        router.push("/sign-in");
      } else if (error.response?.status === 413) {
        errorMessage = ERROR_MESSAGES.FILE_TOO_LARGE;
      } else if (error.response?.status === 429) {
        errorMessage = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error instanceof Error) {
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

      // Ensure chat exists for auth flow
      let ensuredChatId = state.currentChatId;
      if (!ensuredChatId) {
        const chatResponse = await axios.post<ChatCreateResponse>("/api/chats", { 
          title: "New Chat" 
        });
        ensuredChatId = chatResponse.data.id;
        setState(prev => ({ ...prev, currentChatId: ensuredChatId }));
        router.push(`/chat/${ensuredChatId}`);
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
      
      // Create new chat for authenticated users
      const response = await axios.post<ChatCreateResponse>("/api/chats", { title: "New Chat" });
      router.push(`/chat/${response.data.id}`);
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

      // Create chat if we don't have one yet
      let chatId: string | undefined = state.currentChatId || undefined;
      if (!chatId) {
        const title = prompt.substring(0, 50) + (prompt.length > 50 ? "..." : "");
        const response = await axios.post<ChatCreateResponse>("/api/chats", { title });
        chatId = response.data.id;
        setState(prev => ({ ...prev, currentChatId: chatId as string | null }));
        
        // Redirect to chat page for better UX
        router.push(`/chat/${chatId}?message=${encodeURIComponent(prompt)}`);
        return; // Exit early, chat page will handle the message
      }

      // Add user message to UI immediately
      const userMessageElement = createMessageElement(prompt.trim(), true, state.pendingAttachment);
      setState(prev => ({
        ...prev,
        elements: [...prev.elements, userMessageElement],
        input: "",
        pendingAttachment: null,
      }));

      // Send message with chatId to maintain context
      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          file: undefined,
          chatId: chatId, // Always pass chatId for context maintenance
          attachmentText: state.pendingAttachment?.type !== 'image' 
            ? state.pendingAttachment?.extractedTextPreview || undefined 
            : undefined,
          attachmentMeta: state.pendingAttachment ? {
            name: state.pendingAttachment.name,
            mimeType: state.pendingAttachment.mimeType || 'application/octet-stream',
            url: state.pendingAttachment.url,
            type: state.pendingAttachment.type,
            width: null,
            height: null,
            size: state.pendingAttachment.size,
            extractedTextPreview: state.pendingAttachment.extractedTextPreview,
          } : undefined,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to continue.");
          router.push("/sign-in");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle stream response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let aiResponse = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          aiResponse += chunk;
        }
      } finally {
        reader.releaseLock();
      }

      // Handle AI response
      if (aiResponse.trim()) {
        const aiMessageElement = createMessageElement(aiResponse, false);
        setState(prev => ({
          ...prev,
          elements: [...prev.elements, aiMessageElement],
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
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
    handleError,
    createMessageElement
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