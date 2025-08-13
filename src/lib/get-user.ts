import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { User } from "@/lib/types";

export async function getUser(): Promise<User | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (session?.user) {
      const user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || "",
        emailVerified: session.user.emailVerified,
        image: session.user.image || null,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      };
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user session:", error);
    return null;
  }
} 