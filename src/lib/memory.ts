import { MemoryClient } from "mem0ai";

if (!process.env.MEM0_API_KEY) {
  console.warn(
    "MEM0_API_KEY is not defined - memory functionality will be disabled"
  );
}

const mem0Client = process.env.MEM0_API_KEY
  ? new MemoryClient({
      apiKey: process.env.MEM0_API_KEY,
    })
  : null;

// Test the MEM0 client on initialization
if (mem0Client) {
  console.log("MEM0 client initialized with API key length:", process.env.MEM0_API_KEY?.length);
  
  // Test the API key by making a simple call
  (async () => {
    try {
      const testUserId = "init-test-" + Date.now();
      const result = await mem0Client.add([
        {
          role: "user" as const,
          content: "Initialization test memory",
        }
      ], {
        user_id: testUserId,
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      });
      console.log("MEM0 API key test successful:", result);
    } catch (error: unknown) {
      console.error("MEM0 API key test failed:", error);
      console.error("This indicates the API key is invalid or the service is unavailable");
    }
  })();
}

export interface MemorySearchResult {
  id: string;
  memory: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryAddOptions {
  userId: string;
  chatId?: string;
  metadata?: Record<string, unknown>;
}

export interface MemorySearchOptions {
  userId: string;
  limit?: number;
  threshold?: number;
}

interface MemoryApiResponse {
  memory: string;
  score: number;
  metadata?: Record<string, unknown>;
  id?: string;
}

// Export the client for direct use in server actions
export { mem0Client };
export type { MemoryApiResponse }; 