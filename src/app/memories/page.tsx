"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Clock,
  Hash,
  FileText,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Brain,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MemorySearchResult } from "@/lib/memory";
import { useUser } from "@/context/UserContext";
import { 
  getAllMemoriesAction, 
  searchMemoriesAction, 
  deleteMemoryAction 
} from "@/app/actions/memories";

export default function MemoriesPage() {
  const router = useRouter();
  const user = useUser();
  const [memories, setMemories] = useState<MemorySearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<"all" | "search">("all");
  const [error, setError] = useState<string | null>(null);
  // Removed legacy mobile slider menu
  // Removed sidebar state since we're removing the collapse button
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const loadAllMemories = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("=== Loading All Memories ===");
    console.log("User ID:", user?.id);
    
    try {
      const result = await getAllMemoriesAction();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log("Memories loaded:", result.memories.length);
      console.log("First memory sample:", result.memories[0]);
      
      setMemories(result.memories);
      if (result.memories.length === 0) {
        setError("No memories found. Start chatting to create memories!");
        console.log("No memories found for user");
      }
    } catch (error) {
      console.error("Error loading memories:", error);
      setError("Failed to load memories. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load memories when user is authenticated
  useEffect(() => {
    if (user?.id) {
      console.log("=== Memory Page Auth Check ===");
      console.log("User:", user.id ? "Authenticated" : "Not authenticated");
      loadAllMemories();
    }
  }, [user?.id, loadAllMemories]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchMode("all");
      loadAllMemories();
      return;
    }

    setLoading(true);
    setSearchMode("search");
    setError(null);
    console.log("=== Searching Memories ===");
    console.log("Search query:", searchQuery);
    console.log("User ID:", user?.id);
    
    try {
      const result = await searchMemoriesAction({
        query: searchQuery,
        options: {
          limit: 50,
          threshold: 0.1,
        }
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log("Search results:", result.memories.length);
      console.log("Top search result:", result.memories[0]);
      
      setMemories(result.memories);
      if (result.memories.length === 0) {
        setError("No memories found for your search. Try a different query.");
        console.log("No search results found");
      }
    } catch (error) {
      console.error("Error searching memories:", error);
      setError("Failed to search memories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    setDeletingMemoryId(memoryId);
    setShowDeleteConfirm(null);
    
    try {
      const result = await deleteMemoryAction({ memoryId });

      if (result.success) {
        // Remove the deleted memory from the local state
        setMemories(prev => prev.filter(memory => memory.id !== memoryId));
        console.log("Memory deleted successfully:", memoryId);
      } else {
        console.error("Failed to delete memory:", result.error);
        setError("Failed to delete memory. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      setError("Failed to delete memory. Please try again.");
    } finally {
      setDeletingMemoryId(null);
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "Unknown time";
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md mx-4 bg-card rounded-lg p-6 text-center border">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-foreground">
            Sign in to view memories
          </h3>
          <p className="text-muted-foreground">
            Your chat memories will appear here after you sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="container max-w-4xl mx-auto p-6 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8 flex-shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                  Your Memories
                </h1>
                <p className="text-muted-foreground">
                  View and search through your conversation memories stored by AI
                </p>
              </div>
              {/* Removed three-dash mobile slider trigger */}
            </div>
          </div>
 
          {/* Removed legacy mobile slider menu and overlay */}

          {/* Search */}
          <div className="mb-6 flex-shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              {searchMode === "search" ? (
                <>
                  Showing {memories.length} results for &ldquo;{searchQuery}
                  &rdquo;
                </>
              ) : (
                <>Showing {memories.length} memories</>
              )}
            </p>
            {searchMode === "search" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSearchMode("all");
                  loadAllMemories();
                }}
              >
                Show all memories
              </Button>
            )}
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Loading state */}
            {loading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-2">Loading memories...</p>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="text-center py-12 bg-card rounded-lg border">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-foreground">{error}</h3>
              </div>
            )}

            {/* Memories list */}
            {!loading && !error && (
              <div className="space-y-4">
                {memories.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-foreground">
                      No memories found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchMode === "search"
                        ? "Try a different search term or browse all memories."
                        : "Start chatting to create your first memories!"}
                    </p>
                  </div>
                ) : (
                  memories.map((memory) => (
                    <div
                      key={memory.id}
                      className="bg-card rounded-lg p-4 hover:bg-accent/50 transition-colors border group relative"
                    >
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(memory.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingMemoryId === memory.id}
                      >
                        {deletingMemoryId === memory.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === memory.id && (
                        <div className="absolute top-2 right-2 bg-card border rounded-lg p-3 shadow-lg z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="text-sm font-medium">Delete memory?</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMemory(memory.id)}
                              disabled={deletingMemoryId === memory.id}
                            >
                              {deletingMemoryId === memory.id ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Trash2 className="w-3 h-3 mr-1" />
                              )}
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="mb-3 pr-8">
                        <p className="text-sm leading-relaxed text-foreground">
                          {truncateText(memory.memory)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {Boolean(memory.metadata?.timestamp) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate((memory.metadata?.timestamp as string) || "")}</span>
                          </div>
                        )}

                        {Boolean(memory.metadata?.chat_id) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">
                              {((memory.metadata?.chat_id as string) || "").slice(-8)}
                            </span>
                          </div>
                        )}

                        {memory.score && (
                          <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {Math.round(memory.score * 100)}% match
                          </div>
                        )}

                        {memory.metadata?.hasFiles === true && (
                          <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Files
                          </div>
                        )}

                        {memory.metadata?.hasImages === true && (
                          <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Images
                          </div>
                        )}
                      </div>

                      {Boolean(memory.metadata?.userQuery) && (
                        <>
                          <div className="border-t border-border mb-3"></div>
                          <p className="text-xs text-muted-foreground italic">
                            Original query: &ldquo;{(memory.metadata?.userQuery as string) || ""}
                            &rdquo;
                          </p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 