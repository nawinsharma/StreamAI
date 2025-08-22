"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createRagChat(collectionId: string, title: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ragChat = await prisma.ragChat.create({
      data: {
        title,
        userId: session.user.id,
        collectionId,
      },
      include: {
        collection: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return { success: true, data: ragChat };
  } catch (error) {
    console.error("Error creating RAG chat:", error);
    return { success: false, error: "Failed to create RAG chat" };
  }
}

export async function createRagMessage(chatId: string, content: string, role: 'user' | 'assistant', sources?: any[]) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify chat belongs to user
    const chat = await prisma.ragChat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      return { success: false, error: "RAG chat not found" };
    }

    const message = await prisma.ragMessage.create({
      data: {
        content,
        role,
        sources: sources ? sources : undefined,
        chatId,
      },
    });

    return { success: true, data: message };
  } catch (error) {
    console.error("Error creating RAG message:", error);
    return { success: false, error: "Failed to create RAG message" };
  }
}

export async function getRagChats(collectionId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const whereClause = collectionId 
      ? { userId: session.user.id, collectionId }
      : { userId: session.user.id };

    const chats = await prisma.ragChat.findMany({
      where: whereClause,
      include: {
        collection: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return { success: true, data: chats };
  } catch (error) {
    console.error("Error getting RAG chats:", error);
    return { success: false, error: "Failed to get RAG chats" };
  }
}

export async function getRagChat(chatId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const chat = await prisma.ragChat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        collection: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chat) {
      return { success: false, error: "RAG chat not found" };
    }

    return { success: true, data: chat };
  } catch (error) {
    console.error("Error getting RAG chat:", error);
    return { success: false, error: "Failed to get RAG chat" };
  }
}

export async function deleteRagChat(chatId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify chat belongs to user
    const chat = await prisma.ragChat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      return { success: false, error: "RAG chat not found" };
    }

    await prisma.ragChat.delete({
      where: { id: chatId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting RAG chat:", error);
    return { success: false, error: "Failed to delete RAG chat" };
  }
}

export async function createRagCollection(data: {
  name: string;
  collectionName: string;
  summary?: string;
  type: string;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const collection = await prisma.ragCollection.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    return { success: true, data: collection };
  } catch (error) {
    console.error("Error creating RAG collection:", error);
    return { success: false, error: "Failed to create RAG collection" };
  }
}

export async function getRagCollections() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const collections = await prisma.ragCollection.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            ragChats: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: collections };
  } catch (error) {
    console.error("Error getting RAG collections:", error);
    return { success: false, error: "Failed to get RAG collections" };
  }
}

export async function addRagMessage(chatId: string, content: string, role: 'user' | 'assistant', sources?: unknown) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify chat belongs to user
    const ragChat = await prisma.ragChat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!ragChat) {
      return { success: false, error: "RAG chat not found" };
    }

    const message = await prisma.ragMessage.create({
      data: {
        content,
        role,
        sources: sources || undefined,
        chatId,
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.ragChat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return { success: true, data: message };
  } catch (error) {
    console.error("Error adding RAG message:", error);
    return { success: false, error: "Failed to add RAG message" };
  }
}

export async function getRagChatByCollection(collectionId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Find the most recent chat for this collection
    const ragChat = await prisma.ragChat.findFirst({
      where: {
        collectionId,
        userId: session.user.id,
      },
      include: {
        collection: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Get the most recent chat
      },
    });

    if (!ragChat) {
      return { success: false, error: "No chat found for this collection" };
    }

    return { success: true, data: ragChat };
  } catch (error) {
    console.error("Error getting RAG chat by collection:", error);
    return { success: false, error: "Failed to get RAG chat" };
  }
}

export async function getRagChatsForUser(searchQuery?: string | null) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    interface WhereClause {
      userId: string;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        collection?: { name?: { contains: string; mode: 'insensitive' } };
      }>;
    }

    const where: WhereClause = {
      userId: session.user.id,
    };

    if (searchQuery && searchQuery.trim()) {
      where.OR = [
        {
          title: {
            contains: searchQuery.trim(),
            mode: 'insensitive',
          },
        },
        {
          collection: {
            name: {
              contains: searchQuery.trim(),
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const ragChats = await prisma.ragChat.findMany({
      where,
      include: {
        collection: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return { success: true, data: ragChats };
  } catch (error) {
    console.error("Error getting RAG chats:", error);
    return { success: false, error: "Failed to get RAG chats" };
  }
}

export async function deleteRagCollection(collectionId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify collection belongs to user
    const collection = await prisma.ragCollection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    });

    if (!collection) {
      return { success: false, error: "RAG collection not found" };
    }

    await prisma.ragCollection.delete({
      where: { id: collectionId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting RAG collection:", error);
    return { success: false, error: "Failed to delete RAG collection" };
  }
}