"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => Promise<void>;
  isPublic: boolean;
  chatUrl: string;
  isLoading?: boolean;
}

export function ShareDialog({
  isOpen,
  onClose,
  onShare,
  isPublic,
  chatUrl,
  isLoading = false,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    try {
      console.log("Share dialog: Starting share process");
      await onShare();
      console.log("Share dialog: Share process completed");
      // Show the opposite of current state since the toggle just happened
      toast.success(isPublic ? "Chat is now private!" : "Chat is now public!");
    } catch (error) {
      console.error("Share dialog: Error during share process", error);
      toast.error("Failed to update chat visibility");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {isPublic ? "Make Chat Private" : "Share Chat"}
          </DialogTitle>
          <DialogDescription>
            {isPublic ? (
              "This will make your chat private again. Only you will be able to access it."
            ) : (
              <>
                <strong>Warning:</strong> Making this chat public means anyone with the link can view your conversation. 
                This action cannot be undone immediately.
                <br /><br />
                Are you sure you want to make this chat public?
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isPublic && (
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleShare}
            disabled={isLoading}
            className={`w-full sm:w-auto ${
              isPublic 
                ? "bg-gray-600 hover:bg-gray-700" 
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isLoading ? (
              "Updating..."
            ) : isPublic ? (
              "Make Private"
            ) : (
              "Make Public"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
