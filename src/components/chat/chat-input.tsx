import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { SuggestionQuestions } from "./suggestion-questions";
import { User } from "@/types/api";
import { DESIGN_TOKENS } from "@/lib/constants";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (prompt: string) => Promise<void>;
  onFileSelect: (file: File) => Promise<void>;
  isLoading: boolean;
  hasInteracted: boolean;
  limitReached: boolean;
  uploading: boolean;
  user: User | null;
}

export const ChatInput = React.memo(({
  input,
  setInput,
  onSubmit,
  onFileSelect,
  isLoading,
  hasInteracted,
  limitReached,
  uploading,
  user
}: ChatInputProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestionClick = useCallback((question: string, shouldAutoSubmit: boolean = false) => {
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
  }, [setInput, onSubmit]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await onSubmit(input);
  }, [onSubmit, input]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, [setInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSubmit(input.trim());
      }
    }
  }, [input, onSubmit]);

  const isSubmitDisabled = !input.trim() || isLoading;
  const isInputDisabled = isLoading;

  return (
    <div className="border-t border-border bg-background input-area">
      <div className="max-w-4xl mx-auto p-4">
        {/* Suggestion Questions - only show when no messages and not typing */}
        {!hasInteracted && (
          <SuggestionQuestions onQuestionClick={handleSuggestionClick} />
        )}
        
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="flex items-end gap-3"
        >
          {/* File Upload */}
          <AttachmentButton
            onFileSelect={onFileSelect}
            disabled={isLoading}
            uploading={uploading}
          />
          
          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={`${DESIGN_TOKENS.INPUT_MIN_HEIGHT} ${DESIGN_TOKENS.INPUT_MAX_HEIGHT} resize-none pr-12`}
              disabled={isInputDisabled}
            />
            <Button
              type="submit"
              size="sm"
              className={`absolute right-2 bottom-2 ${DESIGN_TOKENS.BUTTON_SIZE} p-0`}
              disabled={isSubmitDisabled}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput'; 