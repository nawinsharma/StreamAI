"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Expand, Eye } from "lucide-react";

interface ChatImageProps {
  src: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChatImage({ src, alt, className = "", size = 'md' }: ChatImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-xs';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      default:
        return 'max-w-md';
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (imageError) {
    return (
      <div className={`flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-border/50 ${className}`}>
        <div className="text-center">
          <Eye className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="relative rounded-lg overflow-hidden border border-border/50 bg-muted/20">
        <Image
          src={src}
          alt={alt}
          width={200}
          height={200}
          className={`w-full h-auto object-contain transition-all duration-300 ${
            isExpanded ? 'max-w-none' : getSizeClasses()
          }`}
          onError={() => setImageError(true)}
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
            >
              <Expand className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Full screen overlay when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={900}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 h-8 w-8 p-0 bg-background/80 hover:bg-background"
            >
              <Expand className="w-4 h-4 rotate-45" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 