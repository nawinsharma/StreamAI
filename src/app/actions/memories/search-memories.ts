"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mem0Client, MemorySearchResult, MemorySearchOptions, MemoryApiResponse } from "@/lib/memory";

export interface SearchMemoriesRequest {
  query: string;
  options: Omit<MemorySearchOptions, "userId">;
}

export async function searchMemoriesAction(
  request: SearchMemoriesRequest
): Promise<{ memories: MemorySearchResult[]; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { memories: [], error: "Unauthorized" };
    }

    if (!mem0Client) {
      return { memories: [], error: "Memory service not available" };
    }

    const { query, options } = request;
    const { limit = 10, threshold = 0.3 } = options;

    const response = (await mem0Client.search(query, {
      user_id: session.user.id,
      limit,
    })) as MemoryApiResponse[];

    const filteredResults: MemorySearchResult[] = response
      .filter((result: MemoryApiResponse) => {
        return result.score >= threshold;
      })
      .map((result: MemoryApiResponse) => ({
        id: result.id || "",
        memory: result.memory,
        score: result.score,
        metadata: result.metadata,
      }));

    return { memories: filteredResults };
  } catch (error) {
    return {
      memories: [],
      error: error instanceof Error ? error.message : "Failed to search memories",
    };
  }
} 