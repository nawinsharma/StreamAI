import React, { useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { SuggestionQuestions } from "./suggestion-questions";
import { DESIGN_TOKENS } from "@/lib/constants";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (prompt: string) => Promise<void>;
  onFileSelect: (file: File) => Promise<void>;
  isLoading: boolean;
  hasInteracted: boolean;
  uploading: boolean;
  showAttachments?: boolean;
  showSuggestions?: boolean;
  // Optional pending file to preview on the home page before upload
  pendingFile?: File | null;
  onRemovePendingFile?: () => void;
}

export const ChatInput = React.memo(({
  input,
  setInput,
  onSubmit,
  onFileSelect,
  isLoading,
  hasInteracted,
  uploading,
  showAttachments = true,
  showSuggestions = true,
  pendingFile = null,
  onRemovePendingFile,
}: ChatInputProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const objectUrlRef = useRef<string | null>(null);

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
        {/* Pending file preview (home page) */}
        {pendingFile && (
          <div className="mb-3">
            {/* Build an object URL for preview */}
            {(() => {
              const ensureUrl = () => {
                if (!objectUrlRef.current) {
                  objectUrlRef.current = URL.createObjectURL(pendingFile);
                }
                return objectUrlRef.current;
              };
              const url = ensureUrl();
              const isImage = pendingFile.type?.startsWith('image/');
              return (
                <div>
                  {isImage ? (
                    <div className="flex items-center gap-3">
                      <Image
                        src={url}
                        alt={pendingFile.name}
                        width={320}
                        height={180}
                        className="max-h-40 w-auto rounded-md border object-contain"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                          objectUrlRef.current = null;
                          onRemovePendingFile?.();
                        }}
                        className="text-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="text-sm">
                        <div className="font-medium">{pendingFile.name}</div>
                        <div className="text-muted-foreground">{pendingFile.type || 'file'} · {Math.round(pendingFile.size / 1024)} KB</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <a href={url} target="_blank" rel="noreferrer" className="text-xs underline">Preview</a>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                            objectUrlRef.current = null;
                            onRemovePendingFile?.();
                          }}
                          className="text-sm"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
        {/* Suggestion Questions - only show when no messages and not typing */}
        {!hasInteracted && showSuggestions && (
          <SuggestionQuestions onQuestionClick={handleSuggestionClick} />
        )}
        
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="flex items-end gap-3"
        >
          {/* File Upload */}
          {showAttachments && (
            <AttachmentButton
              onFileSelect={onFileSelect}
              disabled={isLoading}
              uploading={uploading}
            />
          )}
          
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
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput'; 