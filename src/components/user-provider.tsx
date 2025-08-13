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

   return (
      <UserProvider user={user}>
         {children}
      </UserProvider>
   )
} 