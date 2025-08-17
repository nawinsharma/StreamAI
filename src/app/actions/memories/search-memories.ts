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

    console.log("Searching memories in Mem0:", {
      query: query.substring(0, 100) + "...",
      userId: session.user.id,
      limit,
      threshold,
    });

    const response = (await mem0Client.search(query, {
      user_id: session.user.id,
      limit,
    })) as MemoryApiResponse[];

    console.log(
      "Raw memory search response:",
      JSON.stringify(response, null, 2)
    );

    const filteredResults: MemorySearchResult[] = response
      .filter((result: MemoryApiResponse) => {
        console.log(
          `Memory score: ${result.score}, threshold: ${threshold}, passes: ${
            result.score >= threshold
          }`
        );
        return result.score >= threshold;
      })
      .map((result: MemoryApiResponse) => ({
        id: result.id || "",
        memory: result.memory,
        score: result.score,
        metadata: result.metadata,
      }));

    console.log(
      `Found ${filteredResults.length} relevant memories out of ${response.length} total memories`
    );

    return { memories: filteredResults };
  } catch (error) {
    console.error("Error searching memories:", error);
    return {
      memories: [],
      error: error instanceof Error ? error.message : "Failed to search memories",
    };
  }
} 