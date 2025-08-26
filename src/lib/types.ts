export interface User {
   id: string;
   name: string;
   email: string;
   emailVerified: boolean;
   createdAt: Date;
   updatedAt: Date;
   image?: string | null | undefined;
}

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};