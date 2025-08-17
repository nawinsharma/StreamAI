"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function getChatsForUser(searchQuery?: string | null) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
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

    return { success: true, data: chats };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { success: false, error: "Failed to fetch chats" };
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