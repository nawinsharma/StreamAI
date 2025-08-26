"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mem0Client, MemorySearchResult, MemoryApiResponse } from "@/lib/memory";

export async function getAllMemoriesAction(): Promise<{
  memories: MemorySearchResult[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { memories: [], error: "Unauthorized" };
    }

    if (!mem0Client) {
      return { memories: [], error: "Memory service not available" };
    }

    const response = (await mem0Client.getAll({
      user_id: session.user.id,
    })) as MemoryApiResponse[];

    const memories = response.map((memory: MemoryApiResponse) => ({
      id: memory.id || "",
      memory: memory.memory,
      score: 1.0,
      metadata: memory.metadata,
    }));

    return { memories };
  } catch (error) {
    return {
      memories: [],
      error: error instanceof Error ? error.message : "Failed to get memories",
    };
  }
} 