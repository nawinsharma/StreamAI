"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { useState, useEffect } from "react";
import { User, LogIn, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";

const SidebarFooterSection = () => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const user = useUser();
  const { theme, resolvedTheme } = useTheme();

  // Debug logging
  console.log("SidebarFooter - user from context:", user);
  console.log("SidebarFooter - session state:", session);

  // Get session directly as fallback
  useEffect(() => {
    const getSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData);
        console.log("SidebarFooter - session data:", sessionData);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setSessionLoading(false);
      }
    };

    getSession();
  }, []);

  React.useEffect(() => {
    if (user?.image) {
      setImageSrc(user.image);
      setImageError(false);
    }
  }, [user?.image]);

  const GITHUB_URL = "https://github.com/nawinsharma";

  // Determine if user is authenticated (try context first, then session)
  const isAuthenticated = user || (session?.data?.user);
  const currentUser = user || session?.data?.user;

  // Show loading state while user context is being initialized
  if (user === undefined && sessionLoading) {
    return (
      <div className="flex items-center gap-3 p-2 w-full">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  // Show login button if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth" className="flex-1">
          <Button
            variant="ghost"
            className="w-full h-10 justify-start gap-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            <LogIn className="h-4 w-4" />
            <span className="">Login</span>
          </Button>
        </Link>
        <div className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden transition-opacity duration-500 ease-in-out">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
    setImageSrc(undefined);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <Link href={`/profile/${currentUser?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-8 w-8 group-data-[collapsible=icon]:opacity-0 transition-opacity duration-500 ease-in-out">
          {imageSrc && !imageError ? (
            <div className="relative h-full w-full">
              <Image
                src={imageSrc}
                alt={currentUser?.name || "User"}
                fill
                className="object-cover"
                onError={handleImageError}
                unoptimized={imageSrc.includes('googleusercontent.com')}
                referrerPolicy="no-referrer"
                priority
              />
            </div>
          ) : (
            <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800">
              <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden transition-opacity duration-500 ease-in-out min-w-0">
          <p className="text-sm font-medium whitespace-nowrap truncate text-zinc-700 dark:text-zinc-300">
            {currentUser?.name || "User"}
          </p>
          <p className="text-xs whitespace-nowrap truncate text-zinc-500 dark:text-zinc-400">
            {currentUser?.email?.split("@")[0] || "Free"}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-1">
        <div className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden transition-opacity duration-500 ease-in-out">
          <ThemeToggle />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
              aria-label="View source code"
            >
              <Github className="h-5 w-5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Source code</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default SidebarFooterSection;