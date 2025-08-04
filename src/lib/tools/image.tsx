import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { GeminiImageLoading, GeminiImage } from "@/components/ui/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

const imageSchema = z.object({
  prompt: z.string().describe("Prompt to generate an image"),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function geminiImageData(input: z.infer<typeof imageSchema>): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Google AI API key is not configured");
    }
    
    throw new Error("Image generation with Google AI requires additional setup. Please use OpenAI DALL-E or another image generation service for now.");
    
    // Placeholder code for when Google's image generation API is available:
    /*
    const model = genAI.getGenerativeModel({ model: "imagen-2" });
    
    const result = await model.generateContent([
      input.prompt,
    ]);

    const response = await result.response;
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    */
  } catch (error) {
    console.error("Google AI API Error:", error);
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        ErrorHandler.handleAPIError(error, "Google AI");
      } else if (error.message.includes("rate limit")) {
        ErrorHandler.handleAPIError(error, "Google AI");
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
          value: <GeminiImageLoading />,
          type: "append",
        },
      },
      config,
    );

    try {
      const url = await geminiImageData(input);

      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <GeminiImage url={url} />,
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
            value: <GeminiImage url={undefined} />,
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
      "Generate an AI-generated image based on the provided text prompt. Note: Currently using placeholder implementation for Google AI image generation.",
    schema: imageSchema,
  },
);
