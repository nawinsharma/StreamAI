"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Globe, 
  FileText, 
  Youtube, 
  Loader2
} from "lucide-react";
import { useRagStore } from "@/stores/rag-store";
import { toast } from "sonner";
import { createRagCollection } from "@/app/actions/ragActions";
import { useUser } from "@/context/UserContext";

interface RagUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: 'pdf' | 'website' | 'text' | 'youtube' | null;
}

type UploadType = 'pdf' | 'website' | 'text' | 'youtube';

export function RagUploadModal({ open, onOpenChange, initialType }: RagUploadModalProps) {
  const router = useRouter();
  const user = useUser();
  const [selectedType, setSelectedType] = useState<UploadType>('pdf');
  const [isDragging, setIsDragging] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    isLoading,
    uploadProgress,
    setLoading,
    setUploadProgress,
    addCollection,
    setError
  } = useRagStore();

  // Set the selected type when initialType changes
  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [initialType]);

  const uploadTypes = [
    {
      type: 'pdf' as UploadType,
      icon: Upload,
      title: 'Upload PDF',
      description: 'Extract and index content from PDF documents',
      color: 'text-red-600',
      bgColor: 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800',
    },
    {
      type: 'website' as UploadType,
      icon: Globe,
      title: 'Scrape Website',
      description: 'Index content from any website URL',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800',
    },
    {
      type: 'text' as UploadType,
      icon: FileText,
      title: 'Add Text',
      description: 'Paste text content directly for indexing',
      color: 'text-green-600',
      bgColor: 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800',
    },
    {
      type: 'youtube' as UploadType,
      icon: Youtube,
      title: 'YouTube Video',
      description: 'Extract content from YouTube videos',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800',
    },
  ];

  const getCurrentTypeConfig = () => {
    return uploadTypes.find(type => type.type === selectedType) || uploadTypes[0];
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error("Please sign in to use this feature", {
        description: "RAG uploads are only available for authenticated users.",
        action: {
          label: "Sign In",
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    await processUpload('pdf', file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;
    if (!user) {
      toast.error("Please sign in to use this feature", {
        description: "RAG uploads are only available for authenticated users.",
        action: {
          label: "Sign In",
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    if (file.type !== 'application/pdf') {
      toast.error('Please drop a PDF file');
      return;
    }

    await processUpload('pdf', file);
  };

  const processUpload = async (type: UploadType, file?: File) => {
    try {
      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      
      switch (type) {
        case 'pdf':
          if (!file) throw new Error('No file provided');
          formData.append('pdf', file);
          break;
        case 'website':
          if (!websiteUrl.trim()) throw new Error('Website URL is required');
          formData.append('website', websiteUrl.trim());
          break;
        case 'text':
          if (!textContent.trim()) throw new Error('Text content is required');
          if (!textTitle.trim()) throw new Error('Text title is required');
          formData.append('text', textContent.trim());
          formData.append('title', textTitle.trim());
          break;
        case 'youtube':
          if (!youtubeUrl.trim()) throw new Error('YouTube URL is required');
          formData.append('youtube', youtubeUrl.trim());
          break;
      }

      // Simulate progress
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 10, 90);
        setUploadProgress(currentProgress);
      }, 300);

      const response = await fetch(`/api/rag/${type}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Save to database
      const collectionData = {
        name: result.name || file?.name || textTitle || 'Untitled',
        collectionName: result.collectionName,
        summary: result.summary,
        type,
        sourceUrl: type === 'website' ? websiteUrl : type === 'youtube' ? youtubeUrl : undefined,
        fileName: file?.name,
        fileSize: file?.size,
      };

      const dbResult = await createRagCollection(collectionData);
      
      if (!dbResult.success || !dbResult.data) {
        throw new Error(dbResult.error || 'Failed to save collection');
      }

      // Add to store for immediate UI update
      const newCollection = {
        id: dbResult.data.id,
        name: dbResult.data.name,
        collectionName: dbResult.data.collectionName,
        summary: dbResult.data.summary || undefined,
        type: dbResult.data.type as 'pdf' | 'website' | 'text' | 'youtube',
        sourceUrl: dbResult.data.sourceUrl || undefined,
        fileName: dbResult.data.fileName || undefined,
        fileSize: dbResult.data.fileSize || undefined,
        userId: dbResult.data.userId,
        createdAt: dbResult.data.createdAt,
        updatedAt: dbResult.data.updatedAt,
      };

      addCollection(newCollection);
      
      toast.success(`${uploadTypes.find(t => t.type === type)?.title} processed successfully!`);
      
      // Reset form
      setWebsiteUrl('');
      setYoutubeUrl('');
      setTextContent('');
      setTextTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onOpenChange(false);
      
      // Redirect to the RAG chat page for the new collection
      router.push(`/rag-mode/chat/${dbResult.data.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      toast.error("Please sign in to use this feature", {
        description: "RAG uploads are only available for authenticated users.",
        action: {
          label: "Sign In",
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    processUpload(selectedType);
  };

  const renderUploadForm = () => {
    switch (selectedType) {
      case 'pdf':
        return (
          <div
            className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
              isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <p className="text-xl font-medium text-gray-900 dark:text-white mb-3">
              {isDragging ? 'Drop your PDF here' : 'Upload PDF File'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Drag and drop your PDF file here, or click to browse
            </p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleFileSelect}
              disabled={isLoading}
              className="h-12 px-6 text-base"
            >
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        );

      case 'website':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="website-url" className="text-base font-medium">Website URL</Label>
              <Input
                id="website-url"
                type="url"
                placeholder="https://nawin.xyz"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Enter the URL of the website you want to scrape and index for RAG.
            </p>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="text-title" className="text-base font-medium">Title</Label>
              <Input
                id="text-title"
                placeholder="Enter a title for your text content"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="text-content" className="text-base font-medium">Content</Label>
              <Textarea
                id="text-content"
                placeholder="Paste your text content here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={8}
                disabled={isLoading}
                className="text-base resize-none"
              />
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="youtube-url" className="text-base font-medium">YouTube URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Enter the URL of the YouTube video to extract and index its content.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const currentType = getCurrentTypeConfig();
  const Icon = currentType.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-8">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className={`p-3 rounded-lg ${currentType.bgColor}`}>
              <Icon className={`w-6 h-6 ${currentType.color}`} />
            </div>
            <span>{currentType.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Upload Form */}
          {renderUploadForm()}

          {/* Progress */}
          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (selectedType === 'pdf' && !fileInputRef.current?.files?.[0])}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload & Process'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}