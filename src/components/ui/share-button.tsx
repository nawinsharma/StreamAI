"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { ShareDialog } from "./share-dialog";
import { toast } from "sonner";

interface ShareButtonProps {
  chatId: string;
  isPublic: boolean;
  chatType: "regular" | "rag";
  onTogglePublic: (chatId: string) => Promise<void>;
  className?: string;
}

export function ShareButton({
  chatId,
  isPublic,
  chatType,
  onTogglePublic,
  className,
}: ShareButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Map to actual route segment names
  const pathSegment = chatType === "regular" ? "chat" : "rag";
  const chatUrl = `${window.location.origin}/shared/${pathSegment}/${chatId}`;

  const handleShare = async () => {
    setIsLoading(true);
    try {
      await onTogglePublic(chatId);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to toggle chat public status:", error);
      toast.error("Failed to update chat visibility");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(chatUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {isPublic && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className={className}
            title="Copy link to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className={className}
          title={isPublic ? "Manage sharing" : "Share chat"}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <ShareDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onShare={handleShare}
        isPublic={isPublic}
        chatUrl={chatUrl}
        isLoading={isLoading}
      />
    </>
  );
}
