"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { UserProvider } from "@/context/UserContext"
import { authClient } from "@/lib/auth-client"
import type { User } from "@/lib/types"

interface UserProviderWrapperProps {
   children: React.ReactNode
   initialUser: User | null
}

export default function UserProviderWrapper({ children, initialUser }: UserProviderWrapperProps) {
   const [user, setUser] = useState<User | null>(initialUser)
   const lastSessionCheck = useRef<number>(0)
   const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

   // Function to refresh user state from the server
   const refreshUser = useCallback(async () => {
      try {
         const session = await authClient.getSession();
         if (session?.data?.user) {
            const userData = {
               id: session.data.user.id,
               email: session.data.user.email,
               name: session.data.user.name || "",
               emailVerified: session.data.user.emailVerified,
               image: session.data.user.image || null,
               createdAt: session.data.user.createdAt,
               updatedAt: session.data.user.updatedAt,
            };
            setUser(userData);
         } else {
            setUser(null);
         }
      } catch (error) {
         console.error("Error fetching user session:", error);
         // Don't set user to null on session fetch errors to avoid flickering
         // Only set to null if we get a clear "no session" response
         if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as any).response;
            if (response?.status === 401 || response?.status === 403) {
               setUser(null);
            }
         }
      }
   }, []);

   useEffect(() => {
      // Update user state when initialUser changes
      setUser(initialUser)
   }, [initialUser])

   // Smart auth state checking - only check when needed
   useEffect(() => {
      const checkAuthState = async () => {
         const now = Date.now();
         // Only check if at least 30 seconds have passed since last check
         if (now - lastSessionCheck.current < 30000) {
            return;
         }
         
         try {
            const session = await authClient.getSession();
            const hasUser = !!session?.data?.user;
            const currentHasUser = !!user;
            
            lastSessionCheck.current = now;
            
            // Only update if auth state has actually changed
            if (hasUser !== currentHasUser) {
               await refreshUser();
            }
         } catch (error) {
            console.error("Error checking auth state:", error);
            // If we get rate limited, back off the checking
            if (error && typeof error === 'object' && 'response' in error) {
               const response = (error as any).response;
               if (response?.status === 429) {
                  console.log("Rate limited, backing off session checks");
                  // Clear the interval to stop aggressive checking
                  if (checkIntervalRef.current) {
                     clearInterval(checkIntervalRef.current);
                     checkIntervalRef.current = null;
                  }
                  // Set a longer interval (2 minutes) after rate limiting
                  checkIntervalRef.current = setInterval(checkAuthState, 120000);
                  return;
               }
            }
         }
      };

      // Only set up periodic checking if we don't have an initial user
      // This reduces unnecessary API calls when user is already loaded
      if (!initialUser) {
         // Check immediately
         checkAuthState();
         // Then check every 60 seconds (reduced from 5 seconds)
         checkIntervalRef.current = setInterval(checkAuthState, 60000);
      }

      return () => {
         if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
         }
      };
   }, [user, refreshUser, initialUser]);

   // Listen for visibility changes to check auth when user comes back to tab
   useEffect(() => {
      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
            // Only check if it's been more than 30 seconds since last check
            const now = Date.now();
            if (now - lastSessionCheck.current > 30000) {
               refreshUser();
            }
         }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
   }, [refreshUser]);

   // Handle first-time login when user is authenticated
   useEffect(() => {
      if (user?.id) {
         // Process first-time login in the background
         const processFirstTimeLogin = async () => {
            try {
               const response = await fetch("/api/user/first-login", {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                  },
               });

               if (response.ok) {
                  const data = await response.json();
                  console.log("First-time login processed:", data.message);
               } else {
                  console.error("Failed to process first-time login");
               }
            } catch (error) {
               console.error("Error processing first-time login:", error);
            }
         };

         // Add a small delay to ensure the user context is fully loaded
         const timer = setTimeout(processFirstTimeLogin, 1000);
         return () => clearTimeout(timer);
      }
   }, [user?.id])

   return (
      <UserProvider user={user} refreshUser={refreshUser}>
         {children}
      </UserProvider>
   )
} 