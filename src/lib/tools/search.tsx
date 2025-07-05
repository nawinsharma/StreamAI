import { DynamicStructuredTool } from "@langchain/core/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { RunnableConfig } from "@langchain/core/runnables";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { AIMessageText } from "@/components/message";
import { SearchLoading } from "@/components/ui/search";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

export const searchTool = new DynamicStructuredTool({
  name: "WebSearchTool",
  description: "Searches the web using Tavily API and returns the top result.",
  schema: z.object({
    input: z
      .string()
      .describe("The search query to find relevant information."),
  }),
  func: async ({ input }, _, config?: RunnableConfig) => {
    await dispatchCustomEvent(
      CUSTOM_EVENT_NAME,
      {
        output: {
          value: <SearchLoading />,
          type: "append",
        },
      },
      config,
    );

    try {
      if (!process.env.TAVILY_API_KEY) {
        throw new Error("Tavily API key is not configured");
      }

      const tavilySearch = new TavilySearchResults({ maxResults: 1 });
      const result = await tavilySearch.invoke(input);

      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <AIMessageText content={JSON.parse(result)[0].content} />,
            type: "update",
          },
        },
        config,
      );

      return JSON.stringify(result, null);
    } catch (error) {
      console.error("Search API error:", error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          ErrorHandler.handleAPIError(error, "Tavily");
        } else if (error.message.includes("rate limit") || error.message.includes("quota")) {
          ErrorHandler.handleAPIError(error, "Tavily");
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          ErrorHandler.handleNetworkError(error);
        } else {
          ErrorHandler.handleToolError(createToolError("WebSearchTool", error.message, error));
        }
      }

      // Show error message to user
      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <AIMessageText content="Sorry, I couldn't perform the search. Please try again." />,
            type: "update",
          },
        },
        config,
      );
      
      return JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Search failed',
        results: [] 
      }, null);
    }
  },
});
