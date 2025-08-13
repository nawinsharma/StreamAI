"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Download, FileText, FileImage, FileVideo, FileAudio, FileArchive, FileCode } from "lucide-react";

interface FilePreviewProps {
  file: {
    name: string;
    mimeType: string;
    url: string;
    type: 'image' | 'file';
    size?: number;
    width?: number | null;
    height?: number | null;
  };
  onRemove?: () => void;
  className?: string;
}

const getFileIcon = (mimeType: string, fileName: string) => {
  if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
  if (mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) return <FileText className="w-5 h-5" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('gz')) return <FileArchive className="w-5 h-5" />;
  if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml') || mimeType.includes('csv')) return <FileCode className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileTypeColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (mimeType.startsWith('video/')) return 'text-purple-600 bg-purple-50 border-purple-200';
  if (mimeType.startsWith('audio/')) return 'text-green-600 bg-green-50 border-green-200';
  if (mimeType.includes('pdf')) return 'text-red-600 bg-red-50 border-red-200';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'text-orange-600 bg-orange-50 border-orange-200';
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

export function FilePreview({ file, onRemove, className = "" }: FilePreviewProps) {
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`relative group rounded-xl border-2 border-dashed border-border/50 bg-gradient-to-br from-background to-muted/30 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg ${className}`}>
      {/* Remove button */}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      <div className="flex items-start gap-4">
        {/* File icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center ${getFileTypeColor(file.mimeType)}`}>
          {getFileIcon(file.mimeType, file.name)}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm truncate pr-2">{file.name}</h4>
            <div className="flex items-center gap-2">
              {file.size && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 w-6 p-0 hover:bg-primary/10"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            {file.mimeType} {file.width && file.height && `• ${file.width}×${file.height}`}
          </p>

          {/* Image preview */}
          {file.type === 'image' && !imageError && (
            <div className="relative rounded-lg overflow-hidden border border-border/50 bg-muted/20">
              <Image
                src={file.url}
                alt={file.name}
                width={600}
                height={400}
                className="w-full max-w-full h-auto object-contain rounded-lg"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}

          {/* File type badge */}
          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.mimeType)}`}>
              {file.type === 'image' ? 'Image' : 'Document'}
            </span>
            {file.type === 'file' && (
              <span className="text-xs text-muted-foreground">
                Ready to chat with
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 