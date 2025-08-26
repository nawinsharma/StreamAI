"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRagStore } from "@/stores/rag-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/ui/Header";
import { 
  Upload, 
  Globe, 
  FileText, 
  Youtube, 
  Search,
  MessageCircle,
  Trash2,
  FolderOpen
} from "lucide-react";
import { RagUploadModal } from "@/components/rag/rag-upload-modal";
import { getRagCollections, deleteRagCollection } from "@/app/actions/ragActions";
import { toast } from "sonner";

type UploadType = 'pdf' | 'website' | 'text' | 'youtube';

const RagDashboard = () => {
  const router = useRouter();
  const [selectedUploadType, setSelectedUploadType] = useState<UploadType | null>(null);
  
  const {
    collections,
    searchQuery,
    setSearchQuery,
    isUploadModalOpen,
    setUploadModalOpen,
    setCollections,
  } = useRagStore();

  // Load collections from database
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const result = await getRagCollections();
        if (result.success && result.data) {
          setCollections(result.data.map((col: any) => ({
            id: col.id,
            name: col.name,
            collectionName: col.collectionName,
            summary: col.summary || undefined,
            type: col.type as 'pdf' | 'website' | 'text' | 'youtube',
            sourceUrl: col.sourceUrl || undefined,
            fileName: col.fileName || undefined,
            fileSize: col.fileSize || undefined,
            userId: col.userId,
            createdAt: col.createdAt,
            updatedAt: col.updatedAt,
          })));
        }
      } catch (error) {
        console.error('Failed to load collections:', error);
        toast.error('Failed to load collections');
      }
    };

    loadCollections();
  }, [setCollections]);

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      const result = await deleteRagCollection(collectionId);
      if (result.success) {
        setCollections(collections.filter(c => c.id !== collectionId));
        toast.success('Collection deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete collection');
    }
  };

  const handleCardClick = (type: UploadType) => {
    setSelectedUploadType(type);
    setUploadModalOpen(true);
  };

  const handleCollectionClick = (collectionId: string) => {
    router.push(`/rag-mode/chat/${collectionId}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'website': return <Globe className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'website': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'text': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'youtube': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            RAG Knowledge Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Chat with your documents, websites, and youtube videos
          </p>
        </div>

        {/* Quick Actions - Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col" 
            onClick={() => handleCardClick('pdf')}
          >
            <CardHeader className="text-center flex-1 flex flex-col justify-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-2">
                <Upload className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg">Upload PDF</CardTitle>
              <CardDescription className="text-sm">
                Extract and index content from PDF documents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col" 
            onClick={() => handleCardClick('website')}
          >
            <CardHeader className="text-center flex-1 flex flex-col justify-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Scrape Website</CardTitle>
              <CardDescription className="text-sm">
                Index content from any website URL
              </CardDescription>
            </CardHeader>
          </Card>
{/* 
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col" 
            onClick={() => handleCardClick('text')}
          >
            <CardHeader className="text-center flex-1 flex flex-col justify-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Add Text</CardTitle>
              <CardDescription className="text-sm">
                Paste text content directly for indexing
              </CardDescription>
            </CardHeader>
          </Card> */}

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col" 
            onClick={() => handleCardClick('youtube')}
          >
            <CardHeader className="text-center flex-1 flex flex-col justify-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                <Youtube className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">YouTube Video</CardTitle>
              <CardDescription className="text-sm">
                Extract content from YouTube videos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Collections */}
        {collections.length > 0 && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Collections Grid */}
            {filteredCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollections.map((collection) => (
                  <Card 
                    key={collection.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                    onClick={() => handleCollectionClick(collection.id)}
                  >
                    <CardHeader className="flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(collection.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight break-words">
                              {collection.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(collection.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <Badge className={`${getTypeColor(collection.type)} text-xs`}>
                            {collection.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                      {collection.sourceUrl && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 break-all mb-3">
                          {collection.sourceUrl}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCollectionClick(collection.id);
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Start Chat
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No collections found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first data source.'}
                </p>
              </div>
            )}
          </div>
        )}

        {collections.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Get started with RAG
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Click on any of the cards above to start building your knowledge base.
            </p>
          </div>
        )}

        <RagUploadModal 
          open={isUploadModalOpen} 
          onOpenChange={setUploadModalOpen}
          initialType={selectedUploadType}
        />
      </div>
    </div>
  );
};

export default RagDashboard;