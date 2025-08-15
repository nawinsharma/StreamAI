import React, { useCallback } from "react";
import { ChatImage } from "@/components/ui/chat-image";
import { FilePreview } from "@/components/ui/file-preview";
import { Actions, Action } from "@/components/ui/actions";
import { Markdown } from "@/components/ui/markdown";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Attachment } from "@/types/chat";
import { DESIGN_TOKENS } from "@/lib/constants";

interface ChatMessageProps {
  isUser: boolean;
  content: string | React.ReactNode;
  timestamp: string;
  attachment?: Attachment | null;
  onRemoveAttachment?: () => void;
}

export const ChatMessage = React.memo(({ 
  isUser, 
  content, 
  timestamp, 
  attachment, 
  onRemoveAttachment 
}: ChatMessageProps) => {
  const handleCopy = useCallback(() => {
    if (typeof content === 'string') {
      navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    }
  }, [content]);

  const handleLike = useCallback(() => {
    toast.success("Message liked");
  }, []);

  const handleDislike = useCallback(() => {
    toast.success("Message disliked");
  }, []);

  const handleRedo = useCallback(() => {
    toast.success("Regenerating response...");
  }, []);

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-in slide-in-from-right-2 duration-300">
        <div className={`flex flex-col items-end space-y-2 ${DESIGN_TOKENS.MESSAGE_MAX_WIDTH}`}>
          {attachment && (
            <div className="mb-4">
              {attachment.type === 'image' ? (
                <ChatImage 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="mb-4"
                  size="sm"
                />
              ) : (
                <FilePreview 
                  file={{
                    name: attachment.name,
                    mimeType: attachment.mimeType || 'application/octet-stream',
                    url: attachment.url,
                    type: attachment.type,
                    width: null,
                    height: null,
                    size: attachment.size,
                  }}
                  onRemove={onRemoveAttachment}
                />
              )}
            </div>
          )}
          <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border border-blue-600/20 backdrop-blur-sm">
            <div className="text-sm leading-relaxed font-medium">{content}</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 animate-in slide-in-from-left-2 duration-300 group">
      <div className={`flex flex-col items-start space-y-2 ${DESIGN_TOKENS.MESSAGE_MAX_WIDTH}`}>
        <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
          {typeof content === 'string' ? (
            <Markdown>{content}</Markdown>
          ) : (
            content
          )}
        </div>
        
        {/* Actions - Show on hover - only if content is a string */}
        {typeof content === 'string' && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Actions className="mt-2">
              <Action
                onClick={handleCopy}
                label="Copy"
              >
                <Copy className="size-3" />
              </Action>
              <Action
                onClick={handleLike}
                label="Like"
              >
                <ThumbsUp className="size-3" />
              </Action>
              <Action
                onClick={handleDislike}
                label="Dislike"
              >
                <ThumbsDown className="size-3" />
              </Action>
              <Action
                onClick={handleRedo}
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
});

ChatMessage.displayName = 'ChatMessage'; 