import { streamText, convertToModelMessages, CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { getEnhancedWeather } from "./ai-tools/enhanced-weather";
import prisma from "./prisma";
import { searchMemoriesAction, addMemoryAction } from "@/app/actions/memories";
import { z } from "zod";

export interface ChatRequest {
  messages: CoreMessage[];
  chatId?: string;
  userId?: string;
  attachmentMeta?: {
    name: string;
    mimeType: string;
    url: string;
    type: 'image' | 'file';
    width?: number | null;
    height?: number | null;
    extractedTextPreview?: string | null;
  };
}

export interface ChatResponse {
  stream: ReadableStream<Uint8Array>;
  finalContent: string;
}

/**
 * Normalizes incoming messages to CoreMessage format
 */
export function normalizeMessages(body: any): CoreMessage[] | null {
  const { messages, prompt } = body ?? {};
  
  if (Array.isArray(messages)) {
    const out = messages
      .map((m: any) => {
        const role = m?.role;
        const content = typeof m?.content === "string"
          ? m.content
          : Array.isArray(m?.content)
            ? m.content.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("\n")
            : "";
            
        if (role === "user" || role === "assistant" || role === "system") {
          return { role, content } as CoreMessage;
        }
        return null;
      })
      .filter(Boolean) as CoreMessage[];
      
    return out.length > 0 ? out : null;
  }
  
  if (typeof prompt === "string" && prompt.trim()) {
    return [{ role: "user", content: prompt.trim() }];
  }
  
  return null;
}

/**
 * Creates the system message for AI chat
 */
export function createSystemMessage(): CoreMessage {
  return {
    role: "system",
    content: "You are a helpful AI assistant with comprehensive capabilities. You can help with coding, programming, web development, general questions, image analysis, and more. You have access to a weather tool for city-specific weather information. When asked for code, provide complete, working examples with explanations. Be helpful, accurate, and provide detailed responses when appropriate.",
  };
}

/**
 * Converts messages to UIMessage format for AI SDK
 */
function convertToUIMessages(messages: CoreMessage[]): any[] {
  return messages.map((message) => {
    if (typeof message.content === "string") {
      return {
        role: message.role,
        parts: [{ type: "text", text: message.content }]
      };
    } else {
      // Handle array content (for image messages)
      return {
        role: message.role,
        parts: message.content.map((part: any) => {
          if (part.type === "text") {
            return { type: "text", text: part.text || "" };
          } else if (part.type === "image_url") {
            return { type: "image" as const, image: part.image_url?.url };
          }
          return { type: "text", text: "" };
        })
      };
    }
  });
}

/**
 * Gets the last user message from the messages array
 */
function getLastUserMessage(messages: CoreMessage[]): string {
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUser) return "";
  
  if (typeof lastUser.content === "string") {
    return lastUser.content;
  }
  
  // Handle array content (for image messages)
  const textContent = (lastUser.content as any[]).find((c: any) => c.type === "text");
  return textContent?.text || "";
}

/**
 * Fetches conversation history from database
 */
async function getConversationHistory(chatId: string): Promise<CoreMessage[]> {
  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        content: true,
      },
    });

    console.log(`[Context] Fetched ${messages.length} messages for chat ${chatId}`);
    
    return messages.map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }
}

/**
 * Handles AI chat requests with streaming response
 */
export async function handleAIChatRequest(
  request: ChatRequest
): Promise<ChatResponse> {
  const system = createSystemMessage();
  let assistantCollected = "";

  // Prepare messages for AI SDK
  let messagesToSend: CoreMessage[];
  let useVisionModel = false;

  // If we have a chatId, fetch the conversation history
  let conversationHistory: CoreMessage[] = [];
  if (request.chatId) {
    conversationHistory = await getConversationHistory(request.chatId);
  }

  // Search for relevant memories if user ID is available
  let memoryContext = "";
  if (request.userId && process.env.MEM0_API_KEY) {
    try {
      const lastUserMessage = getLastUserMessage(request.messages);
      if (lastUserMessage) {
        console.log("=== Searching Memories for Context ===");
        console.log("User query:", lastUserMessage);
        console.log("User ID:", request.userId);

        const result = await searchMemoriesAction({
          query: lastUserMessage,
          options: {
            limit: 5,
            threshold: 0.2, // Lower threshold to catch more memories
          }
        });

        console.log("Relevant memories found:", result.memories.length);
        
        if (result.memories.length > 0) {
          memoryContext = result.memories
            .map((memory) => `[Memory - Score: ${memory.score.toFixed(2)}]: ${memory.memory}`)
            .join("\n\n");
          
          console.log("Memory context prepared:", memoryContext.substring(0, 200) + "...");
        }
      }
    } catch (error) {
      console.error("Error searching memories:", error);
    }
  }

  // Create enhanced system message with memory context
  let enhancedSystem = system;
  if (memoryContext) {
    enhancedSystem = {
      role: "system",
      content: `${system.content}\n\nRelevant information from your memory:\n${memoryContext}\n\nUse this information to provide personalized and accurate responses.`,
    } as CoreMessage;
  }

  if (request.attachmentMeta && request.attachmentMeta.type === 'image') {
    // Handle image attachments for vision analysis
    const imageMessage: CoreMessage = {
      role: "user",
      content: [
        {
          type: "image_url" as any,
          image_url: {
            url: request.attachmentMeta.url,
          },
        },
        {
          type: "text",
          text: getLastUserMessage(request.messages) || "What do you see in this image?",
        },
      ] as any,
    };

    // Include conversation history + current image message
    messagesToSend = [enhancedSystem, ...conversationHistory, imageMessage];
    useVisionModel = true;
  } else if (request.attachmentMeta && request.attachmentMeta.type === 'file') {
    // Handle regular file attachments with proper document context
    let systemWithContext = typeof enhancedSystem.content === "string" 
      ? enhancedSystem.content 
      : JSON.stringify(enhancedSystem.content);
    
    if (request.attachmentMeta.extractedTextPreview) {
      systemWithContext += `\n\nThe user has uploaded the following document for analysis:\n\nDocument "${request.attachmentMeta.name}":\n${request.attachmentMeta.extractedTextPreview}\n\nUse this document content to answer the user's questions about the uploaded file.`;
    }
    
    const systemWithDocument: CoreMessage = {
      role: "system",
      content: systemWithContext,
    };

    const fileMessage: CoreMessage = {
      role: "user",
      content: getLastUserMessage(request.messages) || "Please analyze the uploaded document",
    };

    // Include conversation history + current file message
    messagesToSend = [systemWithDocument, ...conversationHistory, fileMessage];
  } else {
    // Regular text message - include conversation history + current message
    messagesToSend = [enhancedSystem, ...conversationHistory, ...request.messages];
  }

  // Convert to UIMessage format and then to ModelMessage format
  const uiMessages = convertToUIMessages(messagesToSend);
  const modelMessages = convertToModelMessages(uiMessages);

  console.log(`[Context] Sending ${messagesToSend.length} messages to AI model (${conversationHistory.length} from history + ${request.messages.length} current + memory context: ${memoryContext ? 'yes' : 'no'})`);

  // Use vision model for images, regular model for text
  const modelName = useVisionModel ? "gemini-1.5-pro" : "gemini-2.5-flash";

  try {
    const result = await streamText({
      model: google(modelName) as any,
      messages: modelMessages,
      tools: {
        weather: {
          description: 'Get current weather information for a city mentioned in the user\'s message',
          inputSchema: z.object({
            userInput: z.string().describe('The user\'s original message or query about weather')
          }),
          execute: async ({ userInput }: { userInput: string }) => {
            const result = await getEnhancedWeather(userInput);
            if (result.success) {
              return {
                ...result.data,
                parsedCity: result.parsedCity
              };
            } else {
              throw new Error(result.error || "Failed to get weather information");
            }
          }
        }
      },
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Start streaming immediately without any delays
          for await (const delta of result.textStream) {
            assistantCollected += delta;
            controller.enqueue(encoder.encode(delta));
          }
          controller.close();
          
          // Save to database if chat context is available
          if (request.chatId) {
            await saveChatToDatabase(request, assistantCollected);
          }
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.error(streamError);
        }
      },
    });

    return { stream, finalContent: assistantCollected };
  } catch (error) {
    console.error("AI chat error:", error);
    
    // Create error stream with proper quota error handling
    const errorStream = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        let errorMessage = "An error occurred while processing your request.";
        
        // Check for quota errors
        if (error instanceof Error) {
          const errorStr = error.message.toLowerCase();
          if (errorStr.includes('quota') || errorStr.includes('resource_exhausted')) {
            if (errorStr.includes('per day') || errorStr.includes('daily')) {
              errorMessage = "Daily AI usage limit reached. Please try again tomorrow.";
            } else if (errorStr.includes('per minute') || errorStr.includes('rate')) {
              errorMessage = "Too many requests. Please wait a moment and try again.";
            } else {
              errorMessage = "AI service quota exceeded. Please try again later.";
            }
          }
        }
        
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      },
    });
    
    return { stream: errorStream, finalContent: "Error: An error occurred while processing your request." };
  }
}

/**
 * Saves AI chat conversation to database
 */
async function saveChatToDatabase(
  request: ChatRequest,
  assistantResponse: string
): Promise<void> {
  try {
    const lastUserMessage = request.messages
      .filter(m => m.role === "user")
      .pop();

    if (lastUserMessage && request.chatId) {
      // Prepare user content with attachment info if present
      let userContent = typeof lastUserMessage.content === "string" 
        ? lastUserMessage.content 
        : JSON.stringify(lastUserMessage.content);
      
      if (request.attachmentMeta) {
        userContent += `\n${JSON.stringify(request.attachmentMeta)}`;
      }

      // Save user message
      await prisma.message.create({
        data: {
          content: userContent,
          role: "user",
          chatId: request.chatId,
        },
      });

      // Save AI response
      await prisma.message.create({
        data: {
          content: assistantResponse,
          role: "assistant",
          chatId: request.chatId,
        },
      });

      // Update chat timestamp
      await prisma.chat.update({
        where: { id: request.chatId },
        data: { updatedAt: new Date() },
      });

      // Add conversation to memory if MEM0_API_KEY is available
      if (process.env.MEM0_API_KEY && request.userId) {
        try {
          console.log("=== Adding to Memory ===");
          const userQuery = typeof lastUserMessage.content === "string" 
            ? lastUserMessage.content 
            : JSON.stringify(lastUserMessage.content);
          const assistantResponseText = assistantResponse.trim();

          // Create a more searchable memory format
          const memoryContent = [
            `User asked about: ${userQuery}`,
            `Assistant provided: ${assistantResponseText.substring(0, 300)}${
              assistantResponseText.length > 300 ? "..." : ""
            }`,
            `Topic: ${
              request.attachmentMeta?.type === 'file'
                ? "file analysis"
                : request.attachmentMeta?.type === 'image'
                ? "image analysis"
                : "general conversation"
            }`,
          ].join("\n");

          console.log(
            "Memory content being stored:",
            memoryContent.substring(0, 200) + "..."
          );

          // Get message count for metadata
          const messageCount = await prisma.message.count({
            where: { chatId: request.chatId }
          });

          const hasFiles = request.attachmentMeta?.type === 'file';
          const hasImages = request.attachmentMeta?.type === 'image';

          await addMemoryAction({
            text: memoryContent,
            options: {
              chatId: request.chatId,
              metadata: {
                timestamp: new Date().toISOString(),
                messageCount: messageCount,
                hasFiles: hasFiles,
                hasImages: hasImages,
                userQuery: userQuery.slice(0, 200), // Store more of the query
                responseLength: assistantResponseText.length,
                conversationType: hasFiles
                  ? "file_analysis"
                  : hasImages
                  ? "image_analysis"
                  : "general",
                // Add keywords for better searchability
                keywords: [
                  ...userQuery
                    .toLowerCase()
                    .split(" ")
                    .filter((word: string) => word.length > 3),
                  ...(hasFiles ? ["file", "document", "analysis"] : []),
                  ...(hasImages ? ["image", "picture", "visual"] : []),
                ].slice(0, 10), // Limit keywords
              },
            },
          });
          
          console.log("=== CONVERSATION ADDED TO MEMORY SUCCESSFULLY ===");
        } catch (error) {
          console.error("Error adding conversation to memory:", error);
        }
      }
    }
  } catch (error) {
    console.error("Failed to save chat conversation:", error);
  }
} 