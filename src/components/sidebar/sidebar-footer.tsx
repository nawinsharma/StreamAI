"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { useState, useEffect } from "react";
import { User, LogIn, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Get session directly as fallback
  useEffect(() => {
    const getSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData);
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
        <Avatar className="h-8 w-8">
          {imageSrc && !imageError ? (
            <Image
              src={imageSrc}
              alt={currentUser?.name || currentUser?.email || "User"}
              width={32}
              height={32}
              className="rounded-full"
              onError={handleImageError}
            />
          ) : (
            <AvatarFallback className="text-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentUser?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {currentUser?.name || currentUser?.email || "User"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {currentUser?.email}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Github className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>View on GitHub</p>
          </TooltipContent>
        </Tooltip>
        <div className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden transition-opacity duration-500 ease-in-out">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default SidebarFooterSection;