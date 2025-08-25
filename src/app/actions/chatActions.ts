"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function getChatsForUser(searchQuery?: string | null) {
  try {
    console.log('Server Action: Fetching chats for user');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.error("Unauthorized access attempt in getChatsForUser");
      throw new Error("Unauthorized");
    }

    console.log(`✅ Server Action: User authenticated: ${session.user.id}`);

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

    console.log(`✅ Server Action: Found ${chats.length} chats for user ${session.user.id}`);

    return { success: true, data: chats };
  } catch (error) {
    console.error("❌ Server Action: Error fetching chats:", error);
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Unauthorized access" };
      }
      if (error.message.includes("database") || error.message.includes("connection")) {
        return { success: false, error: "Database connection error" };
      }
    }
    return { success: false, error: "Failed to fetch chats" };
  }
}

export async function createChat(title: string) {
  try {
    console.log('🔍 Server Action: Creating chat with title:', title);
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.error("❌ Unauthorized access attempt in createChat");
      throw new Error("Unauthorized");
    }

    console.log(`✅ Server Action: User authenticated: ${session.user.id}`);

    if (!title || title.trim().length === 0) {
      console.error("❌ Server Action: Empty title provided");
      throw new Error("Title is required");
    }

    const chat = await prisma.chat.create({
      data: {
        title: title.trim(),
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    });

    console.log(`✅ Server Action: Chat created successfully: ${chat.id}`);

    return { success: true, data: chat };
  } catch (error) {
    console.error("❌ Server Action: Error creating chat:", error);
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Unauthorized access" };
      }
      if (error.message.includes("Title is required")) {
        return { success: false, error: "Title is required" };
      }
      if (error.message.includes("database") || error.message.includes("connection")) {
        return { success: false, error: "Database connection error" };
      }
    }
    return { success: false, error: "Failed to create chat" };
  }
}

export async function deleteChat(chatId: string) {
  try {
    console.log('🔍 Server Action: Deleting chat:', chatId);
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.error("❌ Unauthorized access attempt in deleteChat");
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
      console.error(`❌ Server Action: Chat not found or unauthorized: ${chatId} for user ${session.user.id}`);
      throw new Error("Chat not found");
    }

    // Delete chat (messages will be deleted due to cascade)
    await prisma.chat.delete({
      where: { id: chatId },
    });

    console.log(`✅ Server Action: Chat deleted successfully: ${chatId}`);

    return { success: true };
  } catch (error) {
    console.error("❌ Server Action: Error deleting chat:", error);
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Unauthorized access" };
      }
      if (error.message.includes("Chat not found")) {
        return { success: false, error: "Chat not found" };
      }
      if (error.message.includes("database") || error.message.includes("connection")) {
        return { success: false, error: "Database connection error" };
      }
    }
    return { success: false, error: "Failed to delete chat" };
  }
} 

export async function getChat(chatId: string) {
  try {
    console.log('🔍 Server Action: Getting chat by ID:', chatId);
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.error("❌ Unauthorized access attempt in getChat");
      throw new Error("Unauthorized");
    }

    console.log(`✅ Server Action: User authenticated: ${session.user.id}`);

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      console.error(`❌ Server Action: Chat not found: ${chatId} for user ${session.user.id}`);
      throw new Error("Chat not found");
    }

    console.log(`✅ Server Action: Chat found: ${chat.id} with ${chat.messages.length} messages`);

    return { success: true, data: chat };
  } catch (error) {
    console.error("❌ Server Action: Error getting chat:", error);
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Unauthorized access" };
      }
      if (error.message.includes("Chat not found")) {
        return { success: false, error: "Chat not found" };
      }
      if (error.message.includes("database") || error.message.includes("connection")) {
        return { success: false, error: "Database connection error" };
      }
    }
    return { success: false, error: "Failed to get chat" };
  }
} 