"use client";

import { useState, useRef, useEffect } from "react";
import { useActions } from "ai/rsc";
import { HumanMessageText, AISkeletonLoading } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/error-handler";

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

export default function Home() {
  const { sendMessage } = useActions();

  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      ErrorHandler.handleValidationError("File type", "Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 1) {
      ErrorHandler.handleValidationError("File size", `File size must be less than 1MB. Current size: ${fileSizeInMB.toFixed(2)}MB`);
      return;
    }

    setSelectedFile(file);
  };

  async function onSubmit(prompt: string) {
    if (!prompt || isLoading) return;

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

    try {
      const element = await sendMessage({
        prompt,
        file: base64File
          ? {
              base64: base64File,
            }
          : undefined,
      });
      
      newElements.push(
        <div className="message-enter animate-in slide-in-from-bottom-4 duration-500">
          {element.url && (
            <div className="mb-4 rounded-xl overflow-hidden border border-border/50 shadow-lg">
              <img
                src={element.url}
                alt="Uploaded image"
                className="w-full max-w-2xl h-auto object-cover"
              />
            </div>
          )}
          <HumanMessageText content={input} />
          {element.ui}
        </div>,
      );

      setElements(newElements);
      setInput("");
      setSelectedFile(undefined);
    } catch (error) {
      console.error("Error sending message:", error);
      ErrorHandler.handleGeneralError(error instanceof Error ? error : "Failed to send message", "Message sending");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">Powered by advanced AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col shadow-sm">
          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Welcome Message */}
            {elements.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to AI Assistant</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  I'm here to help you with any questions, tasks, or creative projects. 
                  You can also upload images for analysis.
                </p>
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Text & Image Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Real-time Responses</span>
                  </div>
                </div>
              </div>
            )}

            {/* Date Divider */}
            {elements.length > 0 && (
              <div className="flex items-center justify-center">
                <div className="px-4 py-2 rounded-full bg-gray-100 text-xs text-gray-600">
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
            {elements}
            
            {/* Loading Indicator */}
            {isLoading && <AISkeletonLoading />}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
                title="Upload image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
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
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full min-h-[44px] max-h-32 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-500"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      formRef.current?.requestSubmit();
                    }
                  }}
                />
                {selectedFile && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>

            {/* File Preview */}
            {selectedFile && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(undefined)}
                  className="p-1 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
