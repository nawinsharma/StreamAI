import gTTS from "gtts";
import shortid from "shortid";
import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { Audio, AudioLoading } from "@/components/ui/audio";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

const audioSchema = z.object({
  prompt: z.string().describe("Text to generate audio"),
});

async function audioFile(input: z.infer<typeof audioSchema>): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const uniqueID = shortid.generate();
      const gtts = new gTTS(input.prompt, "en");

      gtts.save(`./public/${uniqueID}.mp3`, function (err: Error | null) {
        if (err) {
          console.error("gTTS error:", err);
          ErrorHandler.handleToolError(createToolError("AudioGenerationTool", err.message || "Failed to generate audio file", err));
          reject(new Error(err.message || "Failed to generate audio file"));
        } else {
          resolve(uniqueID);
        }
      });
    } catch (error) {
      console.error("Audio generation error:", error);
      ErrorHandler.handleToolError(createToolError("AudioGenerationTool", error instanceof Error ? error.message : "Failed to generate audio", error));
      reject(error);
    }
  });
}

export const audioTool = tool(
  async (input, config: RunnableConfig) => {
    await dispatchCustomEvent(
      CUSTOM_EVENT_NAME,
      {
        output: {
          value: <AudioLoading />,
          type: "append",
        },
      },
      config,
    );

    try {
      const audioId = await audioFile(input);

      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <Audio id={audioId} />,
            type: "update",
          },
        },
        config,
      );

      return JSON.stringify({ audioId }, null);
    } catch (error) {
      // Show error message to user
      await dispatchCustomEvent(
        CUSTOM_EVENT_NAME,
        {
          output: {
            value: <Audio id="" />,
            type: "update",
          },
        },
        config,
      );
      
      return JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate audio',
        audioId: "" 
      }, null);
    }
  },
  {
    name: "AudioGenerationTool",
    description: "Text content to convert into an audio file.",
    schema: audioSchema,
  },
);
