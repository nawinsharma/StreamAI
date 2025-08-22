"use client"

import { useEffect, useState, useCallback } from "react"
import { UserProvider } from "@/context/UserContext"
import { authClient } from "@/lib/auth-client"
import type { User } from "@/lib/types"

interface UserProviderWrapperProps {
   children: React.ReactNode
   initialUser: User | null
}

export default function UserProviderWrapper({ children, initialUser }: UserProviderWrapperProps) {
   const [user, setUser] = useState<User | null>(initialUser)

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
         setUser(null);
      }
   }, []);

   useEffect(() => {
      // Update user state when initialUser changes
      setUser(initialUser)
   }, [initialUser])

   // Listen for auth state changes
   useEffect(() => {
      // Set up a periodic check for auth state changes
      const checkAuthState = async () => {
         try {
            const session = await authClient.getSession();
            const hasUser = !!session?.data?.user;
            const currentHasUser = !!user;
            
            // Only update if auth state has changed
            if (hasUser !== currentHasUser) {
               await refreshUser();
            }
         } catch (error) {
            console.error("Error checking auth state:", error);
         }
      };

      // Check immediately and then every 5 seconds
      checkAuthState();
      const interval = setInterval(checkAuthState, 5000);

      return () => clearInterval(interval);
   }, [user, refreshUser]);

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