import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { Video, VideoLoading } from "@/components/ui/video";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  regionCode: string;
  pageInfo: PageInfo;
  items: SearchResult[];
}

interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

interface SearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: Thumbnail;
      medium: Thumbnail;
      high: Thumbnail;
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

const videoSchema = z.object({
  prompt: z.string().describe("Youtube video based on the content"),
});

async function videoUrl(
  input: z.infer<typeof videoSchema>,
): Promise<YouTubeSearchResponse> {
  try {
    if (!process.env.YOUTUBE_DATA_API_KEY) {
      throw new Error("YouTube Data API key is not configured");
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(input.prompt)}&maxResults=1&key=${process.env.YOUTUBE_DATA_API_KEY}`,
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("YouTube Data API authentication failed");
      } else if (response.status === 403) {
        throw new Error("YouTube Data API quota exceeded");
      } else if (response.status >= 500) {
        throw new Error("YouTube Data API service is temporarily unavailable");
      } else {
        throw new Error(`YouTube Data API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "YouTube Data API returned an error");
    }

    return data;
  } catch (err) {
    console.error("YouTube Data API error:", err);
    
    // Handle specific errors
    if (err instanceof Error) {
      if (err.message.includes("API key") || err.message.includes("authentication")) {
        ErrorHandler.handleAPIError(err, "YouTube Data API");
      } else if (err.message.includes("quota")) {
        ErrorHandler.handleAPIError(err, "YouTube Data API");
      } else if (err.message.includes("unavailable")) {
        ErrorHandler.handleAPIError(err, "YouTube Data API");
      } else {
        ErrorHandler.handleToolError(createToolError("YoutubeTool", err.message, err));
      }
    }
    
    throw new Error(`Failed to search for videos: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export const youtubeTool = tool(
  async (input, config: RunnableConfig) => {
    await dispatchCustomEvent(
      CUSTOM_EVENT_NAME,
      {
        output: {
          value: <VideoLoading />,
          type: "append",
        },
      },
      config,
    );

    try {
      const youtubeData = await videoUrl(input);

      let videoId = "";

      if (youtubeData && youtubeData.items.length > 0) {
        videoId = youtubeData.items[0].id.videoId;
      }

      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <Video videoId={videoId} />,
            type: "update",
          },
        },
        config,
      );

      return JSON.stringify({ videoId }, null);
    } catch (error) {
      // Show error message to user
      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <Video videoId="" />,
            type: "update",
          },
        },
        config,
      );
      
      return JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to search for videos',
        videoId: "" 
      }, null);
    }
  },
  {
    name: "YoutubeTool",
    description:
      "A tool to fetch the video/youtube video based on the content by directly searching Youtube.",
    schema: videoSchema,
  },
);
