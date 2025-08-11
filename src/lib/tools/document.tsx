import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { Document, DocumentLoading } from "@/components/ui/document";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

const retriever = new TavilySearchAPIRetriever({
  k: 3,
});

const documentSchema = z.object({
  prompt: z.string().describe("Prompt to retrive documents with links"),
});

export const documentTool = tool(
  async (input, config: RunnableConfig) => {
    await dispatchCustomEvent(
      CUSTOM_EVENT_NAME,
      {
        output: {
          value: <DocumentLoading />,
          type: "append",
        },
      },
      config,
    );

    try {
      if (!process.env.TAVILY_API_KEY) {
        throw new Error("Tavily API key is not configured");
      }

      const retrievedDocuments = await retriever.invoke(input.prompt);

      // Convert Document objects to plain objects for client-side rendering
      const plainDocuments = retrievedDocuments.map(doc => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata
      }));

      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: (
              <Document documents={plainDocuments} />
            ),
            type: "update",
          },
        },
        config,
      );

      return JSON.stringify(retrievedDocuments, null);
    } catch (error) {
      console.error("Document retrieval error:", error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          ErrorHandler.handleAPIError(error, "Tavily");
        } else if (error.message.includes("rate limit") || error.message.includes("quota")) {
          ErrorHandler.handleAPIError(error, "Tavily");
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          ErrorHandler.handleNetworkError(error);
        } else {
          ErrorHandler.handleToolError(createToolError("DocumentGenerationTool", error.message, error));
        }
      }

      // Show error message to user
      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <Document documents={[]} />,
            type: "update",
          },
        },
        config,
      );
      
      return JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to retrieve documents',
        documents: [] 
      }, null);
    }
  },
  {
    name: "DocumentGenerationTool",
    description: "Retrieve documents/links based on the given prompt",
    schema: documentSchema,
  },
);
