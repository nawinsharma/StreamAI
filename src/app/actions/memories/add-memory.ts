"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mem0Client, MemoryAddOptions } from "@/lib/memory";

export interface AddMemoryRequest {
  text: string;
  options: Omit<MemoryAddOptions, "userId">;
}

export async function addMemoryAction(
  request: AddMemoryRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mem0Client) {
      return { success: false, error: "Memory service not available" };
    }

    const { text, options } = request;
    const { chatId, metadata = {} } = options;

    console.log("Adding memory to Mem0:", {
      userId: session.user.id,
      chatId,
      textLength: text.length,
      apiKeyLength: process.env.MEM0_API_KEY?.length,
    });

    // Convert text to the message format expected by mem0 API
    const messages = [
      {
        role: "user" as const,
        content: text,
      },
    ];

    // Add memory using mem0 API
    const result = await mem0Client.add(messages, {
      user_id: session.user.id,
      metadata: {
        ...metadata,
        chat_id: chatId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log("Memory added successfully, result:", result);
    
    // Check if the result indicates success
    if (Array.isArray(result) && result.length === 0) {
      console.warn("Memory add returned empty array - this might indicate an issue");
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding memory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add memory",
    };
  }
} 