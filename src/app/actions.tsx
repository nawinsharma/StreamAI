import { agentExecutor } from "@/lib/graph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { CoreMessage, generateId } from "ai";
import { createAI, getMutableAIState } from "ai/rsc";
import { ReactNode } from "react";
import { streamRunnableUI } from "./server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

interface InputProps {
  prompt: string;
  file?: {
    base64: string;
  };
  chatId?: string;
}

// Helper function to format tool responses
function formatToolResponse(toolResult: any): string {
  if (typeof toolResult === 'string') {
    return toolResult;
  }
  
  if (typeof toolResult === 'object') {
    // Handle chart data - check for the exact structure we're getting
    if (toolResult.type && (toolResult.type === 'pie' || toolResult.type === 'bar' || toolResult.type === 'line') && toolResult.data) {
      // Save chart data as JSON so it can be parsed back into a chart component
      return JSON.stringify(toolResult);
    }
    
    // Handle weather data
    if (toolResult.weather || toolResult.temperature || toolResult.location) {
      if (toolResult.weather) {
        // Save weather data as JSON so it can be parsed back into a weather component
        return JSON.stringify(toolResult.weather);
      }
      return `Weather: ${JSON.stringify(toolResult, null, 2)}`;
    }
    
    // Handle YouTube data
    if (toolResult.youtube || toolResult.videos) {
      const videos = toolResult.youtube || toolResult.videos;
      if (Array.isArray(videos)) {
        // Save YouTube data as JSON so it can be parsed back into a video component
        return JSON.stringify(videos);
      }
      return `YouTube Results:\n${JSON.stringify(videos, null, 2)}`;
    }
    
    // Handle image data
    if (toolResult.type === 'image' && toolResult.cloudinary) {
      // Save image data as JSON so it can be parsed back into an image component
      return JSON.stringify(toolResult);
    }
    
    // Handle web search results
    if (toolResult.search || toolResult.results) {
      const results = toolResult.search || toolResult.results;
      if (Array.isArray(results)) {
        let response = `Search Results (${results.length} results):\n`;
        results.forEach((result: any, index: number) => {
          response += `${index + 1}. ${result.title || result.name || 'Unknown'}\n`;
        });
        return response;
      }
      return `Search Results:\n${JSON.stringify(results, null, 2)}`;
    }
    
    // Generic object formatting
    return `Tool Response:\n${JSON.stringify(toolResult, null, 2)}`;
  }
  
  return `Tool Response: ${String(toolResult)}`;
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

  console.log("=== SENDMESSAGE CALLED ===");
  console.log("Input received:", input);
  console.log("ChatId:", input.chatId);
  console.log("Prompt:", input.prompt);

  const messages = getMutableAIState<typeof AI>("messages");

  try {
    const processInputs = processFile(input, messages.get() as CoreMessage[]);
    console.log("=== PROCESSING INPUTS ===");
    console.log("Processed inputs:", processInputs);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streamUI = streamRunnableUI(agentExecutor() as any, processInputs);
    console.log("=== STREAM UI CREATED ===");

    // Execute the async function immediately and await it
    const processResult = (async () => {
      try {
        console.log("=== WAITING FOR LAST EVENT ===");
        const lastEvent = await streamUI.lastEvent;
        console.log("=== DEBUG: Last event received ===");
        console.log(JSON.stringify(lastEvent, null, 2));
        console.log("=== END DEBUG ===");

        // Add a simple test to see if this code is running
        console.log("=== SERVER-SIDE CODE IS RUNNING ===");
        console.log("Last event type:", typeof lastEvent);
        console.log("Last event keys:", lastEvent ? Object.keys(lastEvent) : "null");

        if (typeof lastEvent === "object" && lastEvent !== null) {
          const event = lastEvent as { 
            invokeModel?: { error?: string; result?: string }; 
            invokeTools?: { error?: string; toolResult?: unknown };
            result?: string;
            content?: string;
            text?: string;
            message?: string;
            [key: string]: any; // Allow any additional properties
          };
          
          console.log("=== DEBUG: Event structure ===");
          console.log("Event keys:", Object.keys(event));
          console.log("invokeModel:", event.invokeModel);
          console.log("invokeTools:", event.invokeTools);
          console.log("result:", event.result);
          console.log("content:", event.content);
          console.log("text:", event.text);
          console.log("message:", event.message);
          console.log("=== END DEBUG ===");
          
          // Check if there's an error
          if (event.invokeModel && event.invokeModel.error) {
            console.log("Model error:", event.invokeModel.error);
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: `I encountered an error: ${event.invokeModel.error}` },
            ]);
            return;
          }
          
          if (event.invokeTools && event.invokeTools.error) {
            console.log("Tool error:", event.invokeTools.error);
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: `I encountered an error while using a tool: ${event.invokeTools.error}` },
            ]);
            return;
          }

          // Check if it's a model result
          if (event.invokeModel && event.invokeModel.result) {
            console.log("Model result:", event.invokeModel.result);
            const aiResponse = event.invokeModel.result;
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: aiResponse },
            ]);

            // Save messages to database if user is authenticated and chatId is provided
            if (input.chatId) {
              try {
                const session = await auth.api.getSession({
                  headers: await headers()
                });
                
                if (session?.user?.id) {
                  console.log("=== SAVING MODEL RESPONSE TO DB ===");
                  // Save user message
                  await prisma.message.create({
                    data: {
                      content: input.prompt,
                      role: "user",
                      chatId: input.chatId,
                    },
                  });

                  // Save AI response
                  await prisma.message.create({
                    data: {
                      content: aiResponse,
                      role: "assistant",
                      chatId: input.chatId,
                    },
                  });

                  // Update chat's updatedAt timestamp and title if it's the first message
                  await prisma.chat.update({
                    where: { id: input.chatId },
                    data: { 
                      updatedAt: new Date(),
                      title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
                    },
                  });
                  console.log("=== MODEL RESPONSE SAVED SUCCESSFULLY ===");
                }
              } catch (error) {
                console.error("Error saving messages to database:", error);
              }
            }
          } 
          // Check if it's a tool result
          else if (event.invokeTools && event.invokeTools.toolResult) {
            console.log("Tool result:", event.invokeTools.toolResult);
            const toolResponse = formatToolResponse(event.invokeTools.toolResult);
            console.log("Formatted tool response:", toolResponse);
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: toolResponse },
            ]);

            // Save messages to database if user is authenticated and chatId is provided
            if (input.chatId) {
              try {
                const session = await auth.api.getSession({
                  headers: await headers()
                });
                
                if (session?.user?.id) {
                  console.log("=== SAVING TOOL RESPONSE TO DB ===");
                  // Save user message
                  await prisma.message.create({
                    data: {
                      content: input.prompt,
                      role: "user",
                      chatId: input.chatId,
                    },
                  });

                  // Save AI response
                  await prisma.message.create({
                    data: {
                      content: toolResponse,
                      role: "assistant",
                      chatId: input.chatId,
                    },
                  });

                  // Update chat's updatedAt timestamp and title if it's the first message
                  await prisma.chat.update({
                    where: { id: input.chatId },
                    data: { 
                      updatedAt: new Date(),
                      title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
                    },
                  });
                  console.log("=== TOOL RESPONSE SAVED SUCCESSFULLY ===");
                }
              } catch (error) {
                console.error("Error saving messages to database:", error);
              }
            }
          } 
          // Check for top-level toolResult (for chart, weather, etc.)
          else if (event.toolResult) {
            console.log("Top-level toolResult:", event.toolResult);
            const toolResponse = formatToolResponse(event.toolResult);
            console.log("Formatted tool response:", toolResponse);
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: toolResponse },
            ]);

            // Save messages to database if user is authenticated and chatId is provided
            if (input.chatId) {
              try {
                const session = await auth.api.getSession({
                  headers: await headers()
                });
                
                if (session?.user?.id) {
                  console.log("=== SAVING TOP-LEVEL TOOLRESULT TO DB ===");
                  // Save user message
                  await prisma.message.create({
                    data: {
                      content: input.prompt,
                      role: "user",
                      chatId: input.chatId,
                    },
                  });

                  // Save AI response
                  await prisma.message.create({
                    data: {
                      content: toolResponse,
                      role: "assistant",
                      chatId: input.chatId,
                    },
                  });

                  // Update chat's updatedAt timestamp and title if it's the first message
                  await prisma.chat.update({
                    where: { id: input.chatId },
                    data: { 
                      updatedAt: new Date(),
                      title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
                    },
                  });
                  console.log("=== TOP-LEVEL TOOLRESULT SAVED SUCCESSFULLY ===");
                }
              } catch (error) {
                console.error("Error saving messages to database:", error);
              }
            }
          }
          // Check for direct result in the event
          else if (lastEvent && typeof lastEvent === 'object' && 'result' in lastEvent) {
            console.log("Direct result:", (lastEvent as any).result);
            const aiResponse = (lastEvent as any).result;
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: aiResponse },
            ]);

            // Save messages to database if user is authenticated and chatId is provided
            if (input.chatId) {
              try {
                const session = await auth.api.getSession({
                  headers: await headers()
                });
                
                if (session?.user?.id) {
                  console.log("=== SAVING DIRECT RESULT TO DB ===");
                  // Save user message
                  await prisma.message.create({
                    data: {
                      content: input.prompt,
                      role: "user",
                      chatId: input.chatId,
                    },
                  });

                  // Save AI response
                  await prisma.message.create({
                    data: {
                      content: aiResponse,
                      role: "assistant",
                      chatId: input.chatId,
                    },
                  });

                  // Update chat's updatedAt timestamp and title if it's the first message
                  await prisma.chat.update({
                    where: { id: input.chatId },
                    data: { 
                      updatedAt: new Date(),
                      title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
                    },
                  });
                  console.log("=== DIRECT RESULT SAVED SUCCESSFULLY ===");
                }
              } catch (error) {
                console.error("Error saving messages to database:", error);
              }
            }
          }
          // Check for content field (common in some AI responses)
          else if (event.content) {
            console.log("Content field:", event.content);
            const aiResponse = event.content;
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: aiResponse },
            ]);

            // Save messages to database if user is authenticated and chatId is provided
            if (input.chatId) {
              try {
                const session = await auth.api.getSession({
                  headers: await headers()
                });
                
                if (session?.user?.id) {
                  console.log("=== SAVING CONTENT FIELD TO DB ===");
                  // Save user message
                  await prisma.message.create({
                    data: {
                      content: input.prompt,
                      role: "user",
                      chatId: input.chatId,
                    },
                  });

                  // Save AI response
                  await prisma.message.create({
                    data: {
                      content: aiResponse,
                      role: "assistant",
                      chatId: input.chatId,
                    },
                  });

                  // Update chat's updatedAt timestamp and title if it's the first message
                  await prisma.chat.update({
                    where: { id: input.chatId },
                    data: { 
                      updatedAt: new Date(),
                      title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
                    },
                  });
                  console.log("=== CONTENT FIELD SAVED SUCCESSFULLY ===");
                }
              } catch (error) {
                console.error("Error saving messages to database:", error);
              }
            }
          }
          // Check for text field (another common format)
          else if (event.text) {
            console.log("Text field:", event.text);
            const aiResponse = event.text;
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: aiResponse },
            ]);

            // Save messages to database if user is authenticated and chatId is provided
            if (input.chatId) {
              try {
                const session = await auth.api.getSession({
                  headers: await headers()
                });
                
                if (session?.user?.id) {
                  console.log("=== SAVING TEXT FIELD TO DB ===");
                  // Save user message
                  await prisma.message.create({
                    data: {
                      content: input.prompt,
                      role: "user",
                      chatId: input.chatId,
                    },
                  });

                  // Save AI response
                  await prisma.message.create({
                    data: {
                      content: aiResponse,
                      role: "assistant",
                      chatId: input.chatId,
                    },
                  });

                  // Update chat's updatedAt timestamp and title if it's the first message
                  await prisma.chat.update({
                    where: { id: input.chatId },
                    data: { 
                      updatedAt: new Date(),
                      title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
                    },
                  });
                  console.log("=== TEXT FIELD SAVED SUCCESSFULLY ===");
                }
              } catch (error) {
                console.error("Error saving messages to database:", error);
              }
            }
          }
          // Check for message field
          else if (event.message) {
            console.log("Message field:", event.message);
            const aiResponse = event.message;
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: aiResponse },
            ]);

            // Save messages to database if user is authenticated and chatId is provided
            if (input.chatId) {
              try {
                const session = await auth.api.getSession({
                  headers: await headers()
                });
                
                if (session?.user?.id) {
                  console.log("=== SAVING MESSAGE FIELD TO DB ===");
                  // Save user message
                  await prisma.message.create({
                    data: {
                      content: input.prompt,
                      role: "user",
                      chatId: input.chatId,
                    },
                  });

                  // Save AI response
                  await prisma.message.create({
                    data: {
                      content: aiResponse,
                      role: "assistant",
                      chatId: input.chatId,
                    },
                  });

                  // Update chat's updatedAt timestamp and title if it's the first message
                  await prisma.chat.update({
                    where: { id: input.chatId },
                    data: { 
                      updatedAt: new Date(),
                      title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
                    },
                  });
                  console.log("=== MESSAGE FIELD SAVED SUCCESSFULLY ===");
                }
              } catch (error) {
                console.error("Error saving messages to database:", error);
              }
            }
          }
          // Handle other cases or log for debugging
          else {
            console.log("Unexpected event structure:", lastEvent);
            // Try to extract any string content from the event
            let aiResponse = "I processed your request.";
            
            // Try to find any string content in the event object
            if (typeof lastEvent === 'object') {
              const eventKeys = Object.keys(lastEvent);
              for (const key of eventKeys) {
                const value = (lastEvent as any)[key];
                if (typeof value === 'string' && value.length > 10) {
                  aiResponse = value;
                  console.log(`Found response in ${key}:`, value);
                  break;
                }
              }
            }
            
            messages.done([
              ...(messages.get() as CoreMessage[]),
              { role: "user", content: input.prompt },
              { role: "assistant", content: aiResponse },
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

    // Wait for the async function to complete
    await processResult;

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
