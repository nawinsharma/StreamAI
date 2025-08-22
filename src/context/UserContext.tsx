"use client"

import type { User } from "@/lib/types";
import { createContext, useContext } from "react";

interface UserContextType {
   user: User | null;
   refreshUser?: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({ user: null });

export const UserProvider = ({
   user,
   refreshUser,
   children,
}: {
   user: User | null;
   refreshUser?: () => Promise<void>;
   children: React.ReactNode;
}) => {
   return <UserContext.Provider value={{ user, refreshUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
   const context = useContext(UserContext);
   return context.user;
};

export const useUserContext = () => {
   return useContext(UserContext);
};
