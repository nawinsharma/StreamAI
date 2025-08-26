"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function getChatsForUser({searchQuery}: {searchQuery?: string | null} = {}) {
  try {

const session = await auth.api.getSession({
  headers: await headers()
});
    const chats = await prisma.chat.findMany({
      where: {
        userId: session?.user.id,
        ...(searchQuery ? {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { messages: { some: { content: { contains: searchQuery, mode: 'insensitive' } } } }
          ]
        } : {}),
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: [
        { pinned: 'desc' },
        { updatedAt: 'desc' }
      ],
    });
    return { success: true, data: chats };
  } catch (error) {
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
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.error(" Unauthorized access attempt in createChat");
      throw new Error("Unauthorized");
    }

    if (!title || title.trim().length === 0) {
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
    return { success: true, data: chat };
  } catch (error) {
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
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.error(" Unauthorized access attempt in deleteChat");
      throw new Error("Unauthorized");
    }
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      console.error(`Server Action: Chat not found or unauthorized: ${chatId} for user ${session.user.id}`);
      throw new Error("Chat not found");
    }

    // Delete chat (messages will be deleted due to cascade)
    await prisma.chat.delete({
      where: { id: chatId },
    });
    return { success: true };
  } catch (error) {
    console.error("Server Action: Error deleting chat:", error);
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

export async function togglePinChat(chatId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: session.user.id },
      select: { id: true, pinned: true }
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { pinned: !chat.pinned }
    });
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Unauthorized access" };
      }
      if (error.message.includes("Chat not found")) {
        return { success: false, error: "Chat not found" };
      }
    }
    return { success: false, error: "Failed to toggle pin" };
  }
}

export async function getChat(chatId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

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
      throw new Error("Chat not found");
    }
    return { success: true, data: chat };
  } catch (error) {
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

export async function getPublicChat(chatId: string) {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!chat) {
      throw new Error("Chat not found or not public");
    }
    return { success: true, data: chat };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Chat not found")) {
        return { success: false, error: "Chat not found or not public" };
      }
      if (error.message.includes("database") || error.message.includes("connection")) {
        return { success: false, error: "Database connection error" };
      }
    }
    return { success: false, error: "Failed to get chat" };
  }
}

export async function toggleChatPublic(chatId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: session.user.id },
      select: { id: true, isPublic: true }
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    console.log("Toggling chat public status:", {
      chatId,
      currentIsPublic: chat.isPublic,
      newIsPublic: !chat.isPublic,
      userId: session.user.id
    });

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { isPublic: !chat.isPublic }
    });
    
    console.log("Chat updated successfully:", updated);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling chat public status:", error);
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return { success: false, error: "Unauthorized access" };
      }
      if (error.message.includes("Chat not found")) {
        return { success: false, error: "Chat not found" };
      }
    }
    return { success: false, error: "Failed to toggle public status" };
  }
} 