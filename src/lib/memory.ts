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