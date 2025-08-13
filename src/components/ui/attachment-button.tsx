"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AttachmentButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  uploading?: boolean;
  className?: string;
}

export function AttachmentButton({ onFileSelect, disabled = false, uploading = false, className = "" }: AttachmentButtonProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useUser();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!user) {
        // Show toast for unauthenticated users
        toast.error("Please sign in to use this feature", {
          description: "File attachments are only available for authenticated users.",
          action: {
            label: "Sign In",
            onClick: () => router.push('/sign-in'),
          },
        });
        return;
      }
      onFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (!user) {
        // Show toast for unauthenticated users
        toast.error("Please sign in to use this feature", {
          description: "File attachments are only available for authenticated users.",
          action: {
            label: "Sign In",
            onClick: () => router.push('/sign-in'),
          },
        });
        return;
      }
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!user) {
      // Show toast for unauthenticated users
      toast.error("Please sign in to use this feature", {
        description: "File attachments are only available for authenticated users.",
        action: {
          label: "Sign In",
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={disabled || uploading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-10 h-10 rounded-full transition-all duration-200",
          "hover:bg-primary/10 hover:scale-105 active:scale-95",
          "border-2 border-dashed border-border/50",
          "flex items-center justify-center",
          isDragOver && "border-primary/50 bg-primary/5 scale-110",
          uploading && "animate-pulse",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        title={uploading ? "Uploading..." : "Attach file"}
      >
        {uploading ? (
          <div className="flex items-center gap-1">
            <Upload className="w-4 h-4 animate-bounce" />
            <span className="text-xs">...</span>
          </div>
        ) : (
          <Paperclip className="w-4 h-4" />
        )}
        
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
            <Upload className="w-4 h-4 text-primary" />
          </div>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="*/*"
        disabled={disabled || uploading}
      />
    </div>
  );
} 