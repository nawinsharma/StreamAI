import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { getEnhancedWeather } from "./ai-tools/enhanced-weather";
import prisma from "./prisma";

export interface CoreMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

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
        parts: message.content.map((part) => {
          if (part.type === "text") {
            return { type: "text", text: part.text || "" };
          } else if (part.type === "image_url") {
            return { type: "image", image: part.image_url?.url };
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
  const textContent = lastUser.content.find(c => c.type === "text");
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
    
    return messages.map((msg) => ({
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

  if (request.attachmentMeta && request.attachmentMeta.type === 'image') {
    // Handle image attachments for vision analysis
    const imageMessage: CoreMessage = {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: request.attachmentMeta.url,
          },
        },
        {
          type: "text",
          text: getLastUserMessage(request.messages) || "What do you see in this image?",
        },
      ],
    };

    // Include conversation history + current image message
    messagesToSend = [system, ...conversationHistory, imageMessage];
    useVisionModel = true;
  } else if (request.attachmentMeta && request.attachmentMeta.type === 'file') {
    // Handle regular file attachments with proper document context
    let systemWithContext = system.content;
    
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
    messagesToSend = [system, ...conversationHistory, ...request.messages];
  }

  // Convert to UIMessage format and then to ModelMessage format
  const uiMessages = convertToUIMessages(messagesToSend);
  const modelMessages = convertToModelMessages(uiMessages);

  console.log(`[Context] Sending ${messagesToSend.length} messages to AI model (${conversationHistory.length} from history + ${request.messages.length} current)`);

  // Use vision model for images, regular model for text
  const modelName = useVisionModel ? "gemini-1.5-pro" : "gemini-2.5-flash";

  try {
    const result = await streamText({
      model: google(modelName) as any,
      messages: modelMessages,
      tools: {
        weather: {
          description: 'Get current weather information for a city mentioned in the user\'s message',
          parameters: {
            type: 'object',
            properties: {
              userInput: {
                type: 'string',
                description: 'The user\'s original message or query about weather'
              }
            },
            required: ['userInput']
          },
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
    }
  } catch (error) {
    console.error("Failed to save chat conversation:", error);
  }
} 