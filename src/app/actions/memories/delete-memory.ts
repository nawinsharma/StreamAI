"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mem0Client, MemoryApiResponse } from "@/lib/memory";

export interface DeleteMemoryRequest {
  memoryId?: string;
  chatId?: string;
}

export async function deleteMemoryAction(
  request: DeleteMemoryRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mem0Client) {
      return { success: false, error: "Memory service not available" };
    }

    const { memoryId, chatId } = request;

    // Handle individual memory deletion
    if (memoryId) {
      console.log("Deleting memory from Mem0:", {
        memoryId,
        userId: session.user.id,
        apiKeyLength: process.env.MEM0_API_KEY?.length,
      });

      await mem0Client.delete(memoryId);
      console.log("Memory deleted successfully:", memoryId);
      return { success: true };
    }
    
    // Handle bulk chat memory deletion
    if (chatId) {
      const memories = (await mem0Client.getAll({
        user_id: session.user.id,
      })) as MemoryApiResponse[];

      // Find and delete memories for this chat
      const chatMemoryIds = memories
        .filter(
          (memory: MemoryApiResponse) => memory.metadata?.chat_id === chatId
        )
        .map((memory: MemoryApiResponse) => memory.id)
        .filter((id): id is string => id !== undefined);

      for (const memoryId of chatMemoryIds) {
        await mem0Client.delete(memoryId);
      }

      console.log(`Deleted ${chatMemoryIds.length} memories for chat ${chatId}`);
      return { success: true };
    }
    
    // Neither memoryId nor chatId provided
    return { success: false, error: "Either memoryId or chatId is required" };
  } catch (error) {
    console.error("Error deleting memory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete memory",
    };
  }
} 