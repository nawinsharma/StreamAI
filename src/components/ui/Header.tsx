"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Brain } from "lucide-react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  shareButton?: React.ReactNode;
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonLabel?: string;
}

export function Header({ shareButton, showBackButton = false, backButtonHref = "/", backButtonLabel = "Back" }: HeaderProps = {}) {
  const router = useRouter();
  const user = useUser();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Successfully signed out!");
      window.location.reload();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleSignOutClick = () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = () => {
    setShowSignOutDialog(false);
    handleSignOut();
  };

  const handleLogin = () => {
    router.push('/sign-in');
  };

  const handleMemoriesClick = () => {
    router.push('/memories');
  };

  return (
    <>
      <header className="relative z-40 bg-background/20 backdrop-blur-md border-none shadow-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full px-4 sm:px-6 py-4 h-16 sm:h-20">
          
          {/* Left side - Back Button or Logo/Brand */}
          <div className="flex items-center flex-shrink-0">
            {showBackButton ? (
              <Link href={backButtonHref}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm font-medium bg-background/50 backdrop-blur-sm border-border/30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backButtonLabel}
                </Button>
              </Link>
            ) : (
              /* This space is reserved for logo or brand */
              null
            )}
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {shareButton && (
              <>
                {shareButton}
                <div className="w-px h-4 sm:h-6 bg-border/30"></div>
              </>
            )}
            <ThemeToggle />
            <div className="w-px h-4 sm:h-6 bg-border/30"></div>
            
            {/* User Profile or Login Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-20 rounded-full border-none">
                    <Avatar>
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || user.email || "User"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          priority={false}
                        />
                      ) : null}
                      <AvatarFallback className="text-base font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 dark:border-gray-600" 
                  align="end" 
                  forceMount
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && (
                        <p className="font-medium text-sm">{user.name}</p>
                      )}
                      {user.email && (
                        <p className="w-48 truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="dark:border-gray-600" />
                  <DropdownMenuItem
                    onClick={handleMemoriesClick}
                    className="cursor-pointer text-sm dark:hover:bg-gray-700"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    <span>Memories</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:border-gray-600" />
                  <DropdownMenuItem
                    onClick={handleSignOutClick}
                    className="cursor-pointer text-sm text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                variant="outline"
                size="sm"
                className="text-sm font-medium bg-background/50 backdrop-blur-sm border-border/30"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="dark:border-gray-600">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account and redirected to the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSignOut}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}