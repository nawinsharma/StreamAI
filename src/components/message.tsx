import { ReactNode } from "react";
import { Actions, Action } from "@/components/ui/actions";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/ui/markdown";

export interface MessageTextProps {
  content: string;
}

export function AIMessageComponent({ children }: { children: ReactNode }) {
  const handleCopy = () => {
    if (typeof children === 'string') {
      navigator.clipboard.writeText(children);
      toast.success("Copied to clipboard");
    }
  };

  const handleLike = () => {
    toast.success("Message liked");
  };

  const handleDislike = () => {
    toast.success("Message disliked");
  };

  const handleRedo = () => {
    toast.success("Regenerating response...");
  };

  return (
    <div className="flex justify-start mb-1 group">
      <div className="flex flex-col items-start space-y-2 max-w-[85%]">
        <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
          <div className="text-sm leading-relaxed font-medium">
            {typeof children === 'string' ? (
              <Markdown>{children}</Markdown>
            ) : (
              children
            )}
          </div>
        </div>
        
        {/* Actions - Show on hover */}
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
      </div>
    </div>
  );
}

export function AIMessageText(props: MessageTextProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(props.content);
    toast.success("Copied to clipboard");
  };

  const handleLike = () => {
    toast.success("Message liked");
  };

  const handleDislike = () => {
    toast.success("Message disliked");
  };

  const handleRedo = () => {
    toast.success("Regenerating response...");
  };

  return (
    <div className="flex justify-start mb-1 group">
      <div className="flex flex-col items-start space-y-2 max-w-[85%]">
        <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
          <div className="text-sm leading-relaxed font-medium">
            <Markdown>{props.content}</Markdown>
          </div>
        </div>
        
        {/* Actions - Show on hover */}
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
      </div>
    </div>
  );
}

export function HumanMessageText(props: MessageTextProps) {
  return (
    <div className="flex justify-end mb-1">
      <div className="flex flex-col items-end space-y-2 max-w-[70%]">
        <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg border border-violet-600/20 backdrop-blur-sm">
          <div className="text-sm leading-relaxed font-medium">{props.content}</div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
          <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}

export function AISkeletonLoading() {
  return (
    <div className="flex justify-start mb-1">
      <div className="flex flex-col items-start space-y-2 max-w-[70%]">
        <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
          <div className="flex flex-col space-y-3">
            <div className="space-y-2">
              <div className="h-3 w-56 bg-gray-300/70 dark:bg-gray-700/70 rounded"></div>
              <div className="h-3 w-80 bg-gray-300/70 dark:bg-gray-700/70 rounded"></div>
              <div className="h-3 w-64 bg-gray-300/70 dark:bg-gray-700/70 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal, no-animation variant for pages preferring zero motion
export function AISkeletonMinimal() {
  return (
    <div className="flex justify-start mb-1">
      <div className="flex flex-col items-start space-y-2 max-w-[70%]">
        <div className="px-6 py-4 rounded-3xl rounded-bl-lg text-gray-900 dark:text-gray-100">
          <div className="space-y-2">
            <div className="h-3 w-56 bg-gray-300/70 dark:bg-gray-700/70 rounded"></div>
            <div className="h-3 w-80 bg-gray-300/70 dark:bg-gray-700/70 rounded"></div>
            <div className="h-3 w-64 bg-gray-300/70 dark:bg-gray-700/70 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
