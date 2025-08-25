"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createRagChat(collectionId: string, title: string) {
  try {
    console.log('🔍 Creating RAG chat - Request started', { collectionId, title });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in createRagChat');
      return { success: false, error: "Unauthorized" };
    }

    console.log(`✅ User authenticated: ${session.user.id}`);

    // Verify collection exists and belongs to user
    const collection = await prisma.ragCollection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    });

    if (!collection) {
      console.log(`❌ Collection not found or unauthorized: ${collectionId} for user ${session.user.id}`);
      return { success: false, error: "Collection not found" };
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

    console.log(`✅ RAG chat created successfully: ${ragChat.id}`);

    return { success: true, data: ragChat };
  } catch (error) {
    console.error("❌ Error creating RAG chat:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
      if (error.message.includes('foreign key constraint')) {
        return { success: false, error: "Invalid collection ID" };
      }
    }
    
    return { success: false, error: "Failed to create RAG chat" };
  }
}

export async function createRagMessage(chatId: string, content: string, role: 'user' | 'assistant', sources?: any[]) {
  try {
    console.log('🔍 Creating RAG message - Request started', { chatId, role, contentLength: content.length });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in createRagMessage');
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
      console.log(`❌ RAG chat not found or unauthorized: ${chatId} for user ${session.user.id}`);
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

    console.log(`✅ RAG message created successfully: ${message.id}`);

    return { success: true, data: message };
  } catch (error) {
    console.error("❌ Error creating RAG message:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
      if (error.message.includes('foreign key constraint')) {
        return { success: false, error: "Invalid chat ID" };
      }
    }
    
    return { success: false, error: "Failed to create RAG message" };
  }
}

export async function getRagChats(collectionId?: string) {
  try {
    console.log('🔍 Getting RAG chats - Request started', { collectionId });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in getRagChats');
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

    console.log(`✅ Found ${chats.length} RAG chats for user ${session.user.id}`);

    return { success: true, data: chats };
  } catch (error) {
    console.error("❌ Error getting RAG chats:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
    return { success: false, error: "Failed to get RAG chats" };
  }
}

export async function getRagChat(chatId: string) {
  try {
    console.log('🔍 Getting RAG chat - Request started', { chatId });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in getRagChat');
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
      console.log(`❌ RAG chat not found: ${chatId} for user ${session.user.id}`);
      return { success: false, error: "RAG chat not found" };
    }

    console.log(`✅ RAG chat found: ${chat.id}`);

    return { success: true, data: chat };
  } catch (error) {
    console.error("❌ Error getting RAG chat:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
    return { success: false, error: "Failed to get RAG chat" };
  }
}

export async function deleteRagChat(chatId: string) {
  try {
    console.log('🔍 Deleting RAG chat - Request started', { chatId });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in deleteRagChat');
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
      console.log(`❌ RAG chat not found or unauthorized: ${chatId} for user ${session.user.id}`);
      return { success: false, error: "RAG chat not found" };
    }

    await prisma.ragChat.delete({
      where: { id: chatId },
    });

    console.log(`✅ RAG chat deleted successfully: ${chatId}`);

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting RAG chat:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
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
    console.log('🔍 Creating RAG collection - Request started', { name: data.name, type: data.type });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in createRagCollection');
      return { success: false, error: "Unauthorized" };
    }

    const collection = await prisma.ragCollection.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    console.log(`✅ RAG collection created successfully: ${collection.id}`);

    return { success: true, data: collection };
  } catch (error) {
    console.error("❌ Error creating RAG collection:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
      if (error.message.includes('unique constraint')) {
        return { success: false, error: "Collection name already exists" };
      }
    }
    
    return { success: false, error: "Failed to create RAG collection" };
  }
}

export async function getRagCollections() {
  try {
    console.log('🔍 Getting RAG collections - Request started');
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in getRagCollections');
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

    console.log(`✅ Found ${collections.length} RAG collections for user ${session.user.id}`);

    return { success: true, data: collections };
  } catch (error) {
    console.error("❌ Error getting RAG collections:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
    return { success: false, error: "Failed to get RAG collections" };
  }
}

export async function addRagMessage(chatId: string, content: string, role: 'user' | 'assistant', sources?: unknown) {
  try {
    console.log('🔍 Adding RAG message - Request started', { chatId, role, contentLength: content.length });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in addRagMessage');
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
      console.log(`❌ RAG chat not found or unauthorized: ${chatId} for user ${session.user.id}`);
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

    console.log(`✅ RAG message added successfully: ${message.id}`);

    return { success: true, data: message };
  } catch (error) {
    console.error("❌ Error adding RAG message:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
      if (error.message.includes('foreign key constraint')) {
        return { success: false, error: "Invalid chat ID" };
      }
    }
    
    return { success: false, error: "Failed to add RAG message" };
  }
}

export async function getRagChatByCollection(collectionId: string) {
  try {
    console.log('🔍 Getting RAG chat by collection - Request started', { collectionId });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in getRagChatByCollection');
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
      console.log(`❌ No RAG chat found for collection: ${collectionId} for user ${session.user.id}`);
      return { success: false, error: "No chat found for this collection" };
    }

    console.log(`✅ RAG chat found for collection: ${ragChat.id}`);

    return { success: true, data: ragChat };
  } catch (error) {
    console.error("❌ Error getting RAG chat by collection:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
    return { success: false, error: "Failed to get RAG chat" };
  }
}

export async function getRagChatsForUser(searchQuery?: string | null) {
  try {
    console.log('🔍 Getting RAG chats for user - Request started', { searchQuery });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in getRagChatsForUser');
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

    console.log(`✅ Found ${ragChats.length} RAG chats for user ${session.user.id}`);

    return { success: true, data: ragChats };
  } catch (error) {
    console.error("❌ Error getting RAG chats for user:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
    return { success: false, error: "Failed to get RAG chats" };
  }
}

export async function deleteRagCollection(collectionId: string) {
  try {
    console.log('🔍 Deleting RAG collection - Request started', { collectionId });
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in deleteRagCollection');
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
      console.log(`❌ RAG collection not found or unauthorized: ${collectionId} for user ${session.user.id}`);
      return { success: false, error: "RAG collection not found" };
    }

    await prisma.ragCollection.delete({
      where: { id: collectionId },
    });

    console.log(`✅ RAG collection deleted successfully: ${collectionId}`);

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting RAG collection:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
    return { success: false, error: "Failed to delete RAG collection" };
  }
}