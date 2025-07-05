import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { DallEIamgeLoading, DalleImage } from "@/components/ui/image";
import OpenAI from "openai";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

const imageSchema = z.object({
  prompt: z.string().describe("Prompt to generate an image"),
});

async function dalleData(input: z.infer<typeof imageSchema>) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: input.prompt,
      n: 1,
      size: "512x512",
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].url;
    } else {
      throw new Error("No image URL returned from DALL-E API");
    }
  } catch (error) {
    console.error("DALL-E API Error:", error);
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        ErrorHandler.handleAPIError(error, "OpenAI");
      } else if (error.message.includes("rate limit")) {
        ErrorHandler.handleAPIError(error, "OpenAI");
      } else {
        ErrorHandler.handleToolError(createToolError("ImageGenerationTool", error.message, error));
      }
    }
    
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const imageTool = tool(
  async (input, config: RunnableConfig) => {
    await dispatchCustomEvent(
      CUSTOM_EVENT_NAME,
      {
        output: {
          value: <DallEIamgeLoading />,
          type: "append",
        },
      },
      config,
    );

    try {
      const url = await dalleData(input);

      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <DalleImage url={url} />,
            type: "update",
          },
        },
        config,
      );

      return JSON.stringify({ url }, null);
    } catch (error) {
      // Show error message to user
      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <DalleImage url={undefined} />,
            type: "update",
          },
        },
        config,
      );
      
      return JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate image',
        url: null 
      }, null);
    }
  },
  {
    name: "ImageGenerationTool",
    description:
      "Generate an AI-generated image based on the provided text prompt, using DALL·E with customizable model version, image size, and quantity.",
    schema: imageSchema,
  },
);
