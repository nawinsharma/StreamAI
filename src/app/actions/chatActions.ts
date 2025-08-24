"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function getChatsForUser(searchQuery?: string | null) {
  try {
    console.log("Fetching chats for user, searchQuery:", searchQuery);
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.error("No session or user ID found");
      throw new Error("Unauthorized");
    }

    console.log("User ID:", session.user.id);

    // Test database connection first
    try {
      await prisma.$connect();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    const whereClause: any = {
      userId: session.user.id,
    };

    // Add search functionality if searchQuery is provided
    if (searchQuery) {
      whereClause.title = {
        contains: searchQuery,
        mode: 'insensitive' as const,
      };
    }

    console.log("Database query where clause:", whereClause);

    const chats = await prisma.chat.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("Successfully fetched chats:", chats.length);
    return { success: true, data: chats };
  } catch (error) {
    console.error("Error fetching chats:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      searchQuery,
      timestamp: new Date().toISOString()
    });
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Database connection failed")) {
        return { success: false, error: "Database connection failed. Please try again." };
      }
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Authentication required" };
      }
    }
    
    return { success: false, error: "Failed to fetch chats. Please try again." };
  } finally {
    // Always disconnect to free up connections
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
  }
}

export async function deleteChat(chatId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify chat exists and belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Delete chat (messages will be deleted due to cascade)
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, error: "Failed to delete chat" };
  }
} 