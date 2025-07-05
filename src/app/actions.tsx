import { agentExecutor } from "@/lib/graph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { CoreMessage, generateId } from "ai";
import { createAI, getMutableAIState } from "ai/rsc";
import { ReactNode } from "react";
import { streamRunnableUI } from "./server";

interface InputProps {
  prompt: string;
  file?: {
    base64: string;
  };
}

const convertChatHistoryToMessage = (chat_history: CoreMessage[]) =>
  chat_history.map(({ role, content }) => {
    switch (role) {
      case "user":
        return new HumanMessage(content as string);
      case "assistant":
      case "system":
        return new AIMessage(content as string);
      default:
        throw new Error(`Unknown role: { role}`);
    }
  });

function processFile(input: InputProps, chat_history: CoreMessage[]) {
  if (input.file) {
    const imageTemplate = new HumanMessage({
      content: [
        {
          type: "image_url",
          image_url: {
            url: input.file.base64,
          },
        },
      ],
    });

    return {
      input: input.prompt,
      chat_history: [
        ...convertChatHistoryToMessage(chat_history),
        imageTemplate,
      ],
    };
  } else {
    return {
      input: input.prompt,
      chat_history: convertChatHistoryToMessage(chat_history),
    };
  }
}

async function sendMessage(input: InputProps) {
  "use server";

  const messages = getMutableAIState<typeof AI>("messages");

  try {
    const processInputs = processFile(input, messages.get() as CoreMessage[]);
    const streamUI = streamRunnableUI(agentExecutor() as any, processInputs);

    (async () => {
      try {
        let lastEvent = await streamUI.lastEvent;

        if (typeof lastEvent === "object" && lastEvent !== null) {
          // Check if there's an error
          if (lastEvent.invokeModel && lastEvent.invokeModel.error) {
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: `I encountered an error: ${lastEvent.invokeModel.error}` },
            ]);
            return;
          }
          
          if (lastEvent.invokeTools && lastEvent.invokeTools.error) {
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: `I encountered an error while using a tool: ${lastEvent.invokeTools.error}` },
            ]);
            return;
          }

          // Check if it's a model result
          if (lastEvent.invokeModel && lastEvent.invokeModel.result) {
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: lastEvent.invokeModel.result },
            ]);
          } 
          // Check if it's a tool result
          else if (lastEvent.invokeTools && lastEvent.invokeTools.toolResult) {
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              {
                role: "assistant",
                content: `Total result: ${JSON.stringify(lastEvent.invokeTools.toolResult, null, 2)}`,
              },
            ]);
          } 
          // Handle other cases or log for debugging
          else {
            console.log("Unexpected event structure:", lastEvent);
            // Still add the user message to maintain conversation flow
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: "I processed your request." },
            ]);
          }
        } else {
          console.log("No valid event received:", lastEvent);
          // Add user message even if no event
          messages.done([
            ...(messages.get() as CoreMessage[]),
            { role: "user", content: input.prompt },
            { role: "assistant", content: "I processed your request." },
          ]);
        }
      } catch (error) {
        console.error("Error processing stream event:", error);
        messages.done([
          ...(messages.get() as CoreMessage[]),
          { role: "user", content: input.prompt },
          { role: "assistant", content: `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}` },
        ]);
      }
    })();

    if (input.file) {
      return {
        ui: streamUI.ui,
        url: input.file.base64,
      };
    }

    return { ui: streamUI.ui };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    messages.done([
      ...(messages.get() as CoreMessage[]),
      { role: "user", content: input.prompt },
      { role: "assistant", content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}` },
    ]);
    
    // Return a simple UI for error cases
    return { ui: null };
  }
}

export type UIState = Array<ReactNode>;

export type AIState = {
  chatId: string;
  messages: Array<CoreMessage>;
};

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      // save to database if needed
      console.log("----------- START ----------");
      console.log(JSON.stringify(state, null, 2));
      console.log("----------- END ----------");
    }
  },
});
