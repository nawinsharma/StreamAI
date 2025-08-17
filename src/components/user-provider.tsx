"use client"

import { useEffect, useState } from "react"
import { UserProvider } from "@/context/UserContext"
import type { User } from "@/lib/types"

interface UserProviderWrapperProps {
   children: React.ReactNode
   initialUser: User | null
}

export default function UserProviderWrapper({ children, initialUser }: UserProviderWrapperProps) {
   const [user, setUser] = useState<User | null>(initialUser)

   useEffect(() => {
      // Update user state when initialUser changes
      setUser(initialUser)
   }, [initialUser])

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
      <UserProvider user={user}>
         {children}
      </UserProvider>
   )
} 