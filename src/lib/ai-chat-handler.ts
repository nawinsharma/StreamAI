import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { getWeather } from "./ai-tools/weather";
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

    messagesToSend = [system, imageMessage];
    useVisionModel = true;
  } else if (request.attachmentMeta && request.attachmentMeta.type === 'file') {
    // Handle regular file attachments
    const fileMessage: CoreMessage = {
      role: "user",
      content: request.attachmentMeta.extractedTextPreview
        ? `${getLastUserMessage(request.messages)}\n\nContext from attached file (${request.attachmentMeta.name}):\n${request.attachmentMeta.extractedTextPreview}`
        : `${getLastUserMessage(request.messages)}\n\nFile attached: ${request.attachmentMeta.name}`,
    };

    messagesToSend = [system, fileMessage];
  } else {
    // Regular text message
    messagesToSend = [system, ...request.messages];
  }

  // Convert to UIMessage format and then to ModelMessage format
  const uiMessages = convertToUIMessages(messagesToSend);
  const modelMessages = convertToModelMessages(uiMessages);

  // Use vision model for images, regular model for text
  const modelName = useVisionModel ? "gemini-1.5-pro" : "gemini-2.5-flash";

  const result = await streamText({
    model: google(modelName) as any,
    messages: modelMessages,
    tools: {
      weather: {
        description: 'Get current weather information for a specific city',
        parameters: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'The city name to get weather for'
            }
          },
          required: ['city']
        },
        execute: async ({ city }: { city: string }) => {
          return await getWeather(city);
        }
      }
    },
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const delta of result.textStream) {
        assistantCollected += delta;
        controller.enqueue(encoder.encode(delta));
      }
      controller.close();
      
      // Save to database if chat context is available
      if (request.chatId && request.userId) {
        await saveChatToDatabase(request, assistantCollected);
      }
    },
  });

  return { stream, finalContent: assistantCollected };
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