"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import Link from "next/link";
import ChatHistory from "@/components/sidebar/chat-history";

const MainSection = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(searchQuery.trim() !== "");
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <header className="px-4 pt-4 pb-2 flex items-center justify-between h-[40px]">
        <h2
          className={cn(
            "text-lg font-normal font-silkscreen tracking-tight",
            "group-data-[collapsible=icon]:opacity-0 transition-all duration-500 ease-in-out",
            "text-zinc-900 dark:text-white"
          )}
          style={{
            fontFamily: 'var(--font-silkscreen)',
            textShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
          }}
        >
          pxt.chat
        </h2>
        <section className="md:flex items-center justify-center group-data-[collapsible=icon]:bg-background group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:rounded group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:left-2 hidden">
          <SidebarTrigger className="group-data-[collapsible=icon]:ml-3 w-fit px-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="hover:bg-zinc-200 dark:hover:bg-zinc-700 w-fit px-2 hidden group-data-[collapsible=icon]:block cursor-pointer"
          >
           <Search className="size-4" />
          </Button>
        </section>
      </header>

      <Link
        href="/"
        className="px-4 py-2 w-full group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all"
      >
        <Button
          variant="default"
          className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 border-2 border-emerald-600 dark:border-emerald-500 text-white flex items-center justify-center group-data-[collapsible=icon]:w-0 cursor-pointer"
        >
          <span className="group-data-[collapsible=icon]:hidden transition-all duration-500 ease-in-out text-white font-semibold">
            New Chat
          </span>
        </Button>
      </Link>

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

      <ChatHistory searchQuery={isSearching ? debouncedSearchQuery : null} />
    </>
  );
};

export default MainSection;