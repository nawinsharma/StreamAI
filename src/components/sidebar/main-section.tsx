"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Brain, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import ChatHistory from "./chat-history";
import { SidebarToggle } from "./sidebar-toggle";

const MainSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSearching = searchQuery.length > 0;
  
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  return (
    <>
      {/* Header with sidebar toggle */}
      <div className="flex items-center justify-between px-4 py-2">
        <SidebarToggle />
      </div>

      {/* New Chat Button */}
      <div className="px-4 py-2 w-full group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all">
        <Link href="/">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
            <Plus className="size-4 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">
              New Chat
            </span>
          </Button>
        </Link>
      </div>

      {/* RAG Mode Button */}
      <Link href="/rag-mode" className="px-4 w-full group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all">
        <Button
          variant="outline"
          className="w-full border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20"
        >
          <BookOpen className="size-4 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">
            RAG Mode
          </span>
        </Button>
      </Link>

      {/* Memory Button */}
      <Link href="/memories" className="px-4 w-full group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all">
        <Button
          variant="outline"
          className="w-full border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
        >
          <Brain className="size-4 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">
            Memories
          </span>
        </Button>
      </Link>

      {/* Search Input */}
      <div className="px-4 py-2 w-full group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all">
        <div className="relative flex items-center bg-transparent rounded-md px-4 py-1 w-full h-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 dark:text-zinc-400" />
          <Input
            type="search"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-5 pr-5 -mt-0.5 bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 text-sm font-normal border-0 focus:ring-0 focus:outline-none w-full"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-4 text-zinc-500 dark:text-zinc-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat History */}
      <ChatHistory searchQuery={isSearching ? debouncedSearchQuery : null} />
    </>
  );
};

export default MainSection;